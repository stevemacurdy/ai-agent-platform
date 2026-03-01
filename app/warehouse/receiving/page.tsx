// @ts-nocheck
'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { getSupabaseBrowser } from '@/lib/supabase-browser';

const PRODUCT_FORMS = ['Sliced', 'Ground/Powder', 'Cubed', 'Whole', 'Diced', 'Pureed', 'Freeze-Dried', 'Concentrated', 'IQF', 'Other'];

export default function ReceivingPage() {
  const router = useRouter();
  const [companyId, setCompanyId] = useState(null);
  const [saving, setSaving] = useState(false);

  // Receiving fields
  const [productName, setProductName] = useState('');
  const [productForm, setProductForm] = useState('Whole');
  const [manufacturer, setManufacturer] = useState('');
  const [lotNumber, setLotNumber] = useState('');
  const [expirationDate, setExpirationDate] = useState('');
  const [sku, setSku] = useState('');
  const [supplierBarcode, setSupplierBarcode] = useState('');
  const [palletCount, setPalletCount] = useState(1);
  const [casesPerPallet, setCasesPerPallet] = useState(0);
  const [caseWeight, setCaseWeight] = useState(0);
  const [notes, setNotes] = useState('');

  // Linked docs
  const [asnId, setAsnId] = useState('');
  const [asns, setAsns] = useState([]);

  // COA upload
  const [coaFile, setCoaFile] = useState(null);
  const [packingListFile, setPackingListFile] = useState(null);

  // Generated pallets preview
  const [generatedPallets, setGeneratedPallets] = useState([]);

  useEffect(() => {
    const init = async () => {
      const sb = getSupabaseBrowser();
      const { data: { session } } = await sb.auth.getSession();
      if (!session?.user) return;
      const { data: memberships } = await sb
        .from('company_members').select('company_id, companies(portal_type)').eq('user_id', session.user.id);
      const wh = memberships?.find(m => m.companies?.portal_type === 'warehouse' || m.companies?.portal_type === 'both') || memberships?.[0];
      if (!wh) return;
      setCompanyId(wh.company_id);
      const { data: asnData } = await sb.from('asn_documents').select('id, asn_number, file_name')
        .eq('company_id', wh.company_id).order('created_at', { ascending: false }).limit(20);
      setAsns(asnData || []);
    };
    init();
  }, []);

  // Preview pallets before creating
  const previewPallets = () => {
    if (!productName.trim()) return;
    const pallets = [];
    for (let i = 0; i < palletCount; i++) {
      const palletNum = `PLT-${Date.now().toString(36).toUpperCase()}-${String(i + 1).padStart(3, '0')}`;
      pallets.push({
        pallet_number: palletNum,
        product_name: productName,
        product_form: productForm,
        expiration_date: expirationDate || null,
        manufacturer: manufacturer || null,
        lot_number: lotNumber || null,
        sku: sku || null,
        supplier_barcode: supplierBarcode || null,
        case_qty: casesPerPallet,
        case_weight: caseWeight,
        pallet_weight: null, // Added after receiving
        pallet_weight_confirmed: false,
      });
    }
    setGeneratedPallets(pallets);
  };

  const receive = async () => {
    if (!companyId || generatedPallets.length === 0) return;
    setSaving(true);

    try {
      const sb = getSupabaseBrowser();
      const { data: { session } } = await sb.auth.getSession();
      if (!session?.user) return;
      const today = new Date().toISOString().split('T')[0];

      // Create pallet records
      const palletInserts = generatedPallets.map(p => {
        const qrData = {
          pallet: p.pallet_number,
          product: p.product_name,
          form: p.product_form,
          expiration: p.expiration_date,
          manufacturer: p.manufacturer,
          lot: p.lot_number,
          received: today,
          sku: p.sku,
          cases: p.case_qty,
          case_weight: p.case_weight,
          asn: asnId || null,
        };

        return {
          company_id: companyId,
          asn_id: asnId || null,
          pallet_number: p.pallet_number,
          product_name: p.product_name,
          product_form: p.product_form,
          expiration_date: p.expiration_date,
          manufacturer: p.manufacturer,
          lot_number: p.lot_number,
          received_date: today,
          sku: p.sku,
          supplier_barcode: p.supplier_barcode,
          case_qty: p.case_qty,
          case_weight: p.case_weight,
          pallet_weight: null,
          pallet_weight_confirmed: false,
          qr_code_data: qrData,
          direction: 'inbound',
          status: 'received',
          notes: notes || null,
        };
      });

      const { data: pallets, error: palletErr } = await sb
        .from('warehouse_pallets').insert(palletInserts).select();

      if (palletErr) throw palletErr;

      // Create packing list
      const plNumber = `PL-${Date.now().toString(36).toUpperCase()}`;
      const { data: pl } = await sb
        .from('packing_lists').insert({
          company_id: companyId,
          asn_id: asnId || null,
          packing_list_number: plNumber,
          direction: 'inbound',
          created_by: session.user.id,
        }).select().single();

      if (pl && pallets) {
        const plItems = pallets.map(p => ({
          packing_list_id: pl.id,
          pallet_id: p.id,
          product_name: p.product_name,
          product_form: p.product_form,
          sku: p.sku,
          lot_number: p.lot_number,
          case_qty: p.case_qty,
          case_weight: p.case_weight,
        }));
        await sb.from('packing_list_items').insert(plItems);
      }

      // Create COA record if lot number provided
      if (lotNumber) {
        const coaNumber = `COA-${Date.now().toString(36).toUpperCase()}`;
        await sb.from('certificates_of_analysis').insert({
          company_id: companyId,
          asn_id: asnId || null,
          coa_number: coaNumber,
          manufacturer: manufacturer || null,
          lot_number: lotNumber,
          expiration_date: expirationDate || null,
          sku: sku || null,
          created_by: session.user.id,
        });
      }

      router.push('/warehouse/pallets');
    } catch (err) {
      console.error('Receiving failed:', err);
      alert('Failed to receive: ' + (err.message || 'Unknown error'));
    }
    setSaving(false);
  };

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-white">Receive Inbound Shipment</h1>
        <p className="text-sm text-[#6B7280] mt-1">Process incoming product into pallet records with QR codes</p>
      </div>

      <div className="space-y-6">
        {/* Link to ASN */}
        <div className="bg-white border border-[#E5E7EB] shadow-sm rounded-xl p-5 space-y-4">
          <h2 className="text-sm font-semibold text-[#4B5563] uppercase tracking-wider">Link to ASN</h2>
          <select value={asnId} onChange={(e) => setAsnId(e.target.value)}
            className="w-full bg-white border border-[#E5E7EB] shadow-sm rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-[#2A9D8F]">
            <option value="" className="bg-white">No ASN (manual receiving)</option>
            {asns.map(a => (
              <option key={a.id} value={a.id} className="bg-white">{a.asn_number} — {a.file_name || 'No file'}</option>
            ))}
          </select>
        </div>

        {/* Product Info — Priority Order */}
        <div className="bg-white border border-[#E5E7EB] shadow-sm rounded-xl p-5 space-y-4">
          <h2 className="text-sm font-semibold text-[#4B5563] uppercase tracking-wider">Product Information</h2>
          <p className="text-xs text-[#9CA3AF]">Fields in order of importance for pallet identification</p>

          <div className="grid grid-cols-2 gap-4">
            <div className="col-span-2">
              <label className="block text-xs text-[#6B7280] mb-1">
                <span className="inline-flex items-center justify-center w-4 h-4 rounded-full bg-blue-600 text-[10px] text-white mr-1">1</span>
                Product Name *
              </label>
              <input type="text" value={productName} onChange={(e) => setProductName(e.target.value)}
                placeholder="e.g. Apple, Orange, Cherry, Blueberry"
                className="w-full bg-white border border-[#E5E7EB] shadow-sm rounded-lg px-3 py-2 text-sm text-white placeholder-[#9CA3AF] focus:outline-none focus:border-[#2A9D8F]" />
            </div>

            <div>
              <label className="block text-xs text-[#6B7280] mb-1">
                <span className="inline-flex items-center justify-center w-4 h-4 rounded-full bg-blue-600 text-[10px] text-white mr-1">2</span>
                Product Form *
              </label>
              <select value={productForm} onChange={(e) => setProductForm(e.target.value)}
                className="w-full bg-white border border-[#E5E7EB] shadow-sm rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-[#2A9D8F]">
                {PRODUCT_FORMS.map(f => (
                  <option key={f} value={f} className="bg-white">{f}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs text-[#6B7280] mb-1">
                <span className="inline-flex items-center justify-center w-4 h-4 rounded-full bg-blue-600 text-[10px] text-white mr-1">3</span>
                Expiration Date
              </label>
              <input type="date" value={expirationDate} onChange={(e) => setExpirationDate(e.target.value)}
                className="w-full bg-white border border-[#E5E7EB] shadow-sm rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-[#2A9D8F]" />
            </div>

            <div>
              <label className="block text-xs text-[#6B7280] mb-1">
                <span className="inline-flex items-center justify-center w-4 h-4 rounded-full bg-blue-600 text-[10px] text-white mr-1">4</span>
                Manufacturer
              </label>
              <input type="text" value={manufacturer} onChange={(e) => setManufacturer(e.target.value)}
                placeholder="Supplier / MFG name"
                className="w-full bg-white border border-[#E5E7EB] shadow-sm rounded-lg px-3 py-2 text-sm text-white placeholder-[#9CA3AF] focus:outline-none focus:border-[#2A9D8F]" />
            </div>

            <div>
              <label className="block text-xs text-[#6B7280] mb-1">
                <span className="inline-flex items-center justify-center w-4 h-4 rounded-full bg-blue-600 text-[10px] text-white mr-1">5</span>
                Lot #
              </label>
              <input type="text" value={lotNumber} onChange={(e) => setLotNumber(e.target.value)}
                placeholder="Manufacturer lot number"
                className="w-full bg-white border border-[#E5E7EB] shadow-sm rounded-lg px-3 py-2 text-sm text-white placeholder-[#9CA3AF] focus:outline-none focus:border-[#2A9D8F]" />
            </div>

            <div>
              <label className="block text-xs text-[#6B7280] mb-1">SKU</label>
              <input type="text" value={sku} onChange={(e) => setSku(e.target.value)}
                placeholder="Your internal SKU"
                className="w-full bg-white border border-[#E5E7EB] shadow-sm rounded-lg px-3 py-2 text-sm text-white placeholder-[#9CA3AF] focus:outline-none focus:border-[#2A9D8F]" />
            </div>

            <div>
              <label className="block text-xs text-[#6B7280] mb-1">Supplier Barcode</label>
              <input type="text" value={supplierBarcode} onChange={(e) => setSupplierBarcode(e.target.value)}
                placeholder="Supplier's barcode value"
                className="w-full bg-white border border-[#E5E7EB] shadow-sm rounded-lg px-3 py-2 text-sm text-white placeholder-[#9CA3AF] focus:outline-none focus:border-[#2A9D8F]" />
            </div>
          </div>
        </div>

        {/* Pallet Details */}
        <div className="bg-white border border-[#E5E7EB] shadow-sm rounded-xl p-5 space-y-4">
          <h2 className="text-sm font-semibold text-[#4B5563] uppercase tracking-wider">Pallet Details</h2>

          <div className="grid grid-cols-3 gap-4">
            <div>
              <label className="block text-xs text-[#6B7280] mb-1">Number of Pallets</label>
              <input type="number" min={1} max={100} value={palletCount} onChange={(e) => setPalletCount(parseInt(e.target.value) || 1)}
                className="w-full bg-white border border-[#E5E7EB] shadow-sm rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-[#2A9D8F]" />
            </div>
            <div>
              <label className="block text-xs text-[#6B7280] mb-1">Cases per Pallet</label>
              <input type="number" min={0} value={casesPerPallet} onChange={(e) => setCasesPerPallet(parseInt(e.target.value) || 0)}
                className="w-full bg-white border border-[#E5E7EB] shadow-sm rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-[#2A9D8F]" />
            </div>
            <div>
              <label className="block text-xs text-[#6B7280] mb-1">Case Weight (lbs)</label>
              <input type="number" min={0} step={0.1} value={caseWeight} onChange={(e) => setCaseWeight(parseFloat(e.target.value) || 0)}
                className="w-full bg-white border border-[#E5E7EB] shadow-sm rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-[#2A9D8F]" />
            </div>
          </div>

          <div className="p-3 bg-amber-50 border border-amber-500/20 rounded-lg">
            <p className="text-xs text-amber-300">
              Pallet weight will be entered individually after receiving each pallet on the warehouse floor.
              {palletCount > 1 && ` All ${palletCount} pallets will share the same product/lot info — only weight will differ.`}
            </p>
          </div>
        </div>

        {/* Notes */}
        <div className="bg-white border border-[#E5E7EB] shadow-sm rounded-xl p-5">
          <label className="block text-xs text-[#6B7280] mb-1">Receiving Notes</label>
          <textarea value={notes} onChange={(e) => setNotes(e.target.value)} rows={2}
            placeholder="Condition notes, discrepancies, special handling..."
            className="w-full bg-white border border-[#E5E7EB] shadow-sm rounded-lg px-3 py-2 text-sm text-white placeholder-[#9CA3AF] focus:outline-none focus:border-[#2A9D8F] resize-none" />
        </div>

        {/* Preview */}
        {generatedPallets.length > 0 && (
          <div className="bg-white border border-[#E5E7EB] shadow-sm rounded-xl p-5 space-y-3">
            <h2 className="text-sm font-semibold text-[#4B5563] uppercase tracking-wider">
              Preview: {generatedPallets.length} Pallet{generatedPallets.length > 1 ? 's' : ''} to Create
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {generatedPallets.slice(0, 6).map((p, i) => (
                <div key={i} className="p-3 bg-white shadow-sm rounded-lg border border-[#E5E7EB]">
                  <div className="flex items-center justify-between">
                    <span className="font-mono text-xs text-blue-600">{p.pallet_number}</span>
                    <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-600/50 text-emerald-300">QR will be generated</span>
                  </div>
                  <p className="text-sm text-white mt-1">{p.product_name} — {p.product_form}</p>
                  <p className="text-xs text-[#6B7280] mt-0.5">
                    {[p.manufacturer, p.lot_number && `Lot: ${p.lot_number}`, p.case_qty > 0 && `${p.case_qty} cases`].filter(Boolean).join(' · ')}
                  </p>
                </div>
              ))}
              {generatedPallets.length > 6 && (
                <div className="p-3 bg-white shadow-sm rounded-lg border border-[#E5E7EB] flex items-center justify-center">
                  <span className="text-sm text-[#6B7280]">+ {generatedPallets.length - 6} more pallets</span>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Actions */}
        <div className="flex items-center gap-3 justify-end">
          <button onClick={() => router.push('/warehouse')}
            className="px-4 py-2.5 rounded-lg text-sm text-[#6B7280] hover:text-[#4B5563] transition-colors">Cancel</button>
          {generatedPallets.length === 0 ? (
            <button onClick={previewPallets} disabled={!productName.trim()}
              className="px-5 py-2.5 rounded-lg bg-blue-600 hover:bg-blue-500 disabled:opacity-30 text-sm text-white font-medium transition-colors">
              Preview Pallets
            </button>
          ) : (
            <>
              <button onClick={() => setGeneratedPallets([])}
                className="px-4 py-2.5 rounded-lg bg-gray-100 hover:bg-white/15 text-sm text-[#4B5563] transition-colors">Edit</button>
              <button onClick={receive} disabled={saving}
                className="px-5 py-2.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 disabled:opacity-30 text-sm text-white font-medium transition-colors">
                {saving ? 'Receiving...' : `Receive ${generatedPallets.length} Pallet${generatedPallets.length > 1 ? 's' : ''}`}
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
