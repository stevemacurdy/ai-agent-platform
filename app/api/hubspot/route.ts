// @ts-nocheck
// app/api/hubspot/route.ts
// Main HubSpot API handler for Marketing Agent
import { NextRequest, NextResponse } from 'next/server';
import { getHubSpotClient } from '@/lib/hubspot';

export async function GET(request: NextRequest) {
  try {
    const hubspot = getHubSpotClient();
    const searchParams = request.nextUrl.searchParams;
    const action = searchParams.get('action');

    switch (action) {
      case 'dashboard': {
        // Get dashboard summary data
        const [contacts, companies, deals, lifecycleStages] = await Promise.all([
          hubspot.getContacts(10),
          hubspot.getCompanies(10),
          hubspot.getDeals(10),
          hubspot.getContactsByLifecycleStage(),
        ]);

        return NextResponse.json({
          contacts: {
            total: contacts.total || contacts.results?.length || 0,
            recent: contacts.results || [],
          },
          companies: {
            total: companies.total || companies.results?.length || 0,
            recent: companies.results || [],
          },
          deals: {
            total: deals.total || deals.results?.length || 0,
            recent: deals.results || [],
            totalValue: deals.results?.reduce((sum: number, d: any) => sum + (parseFloat(d.properties?.amount) || 0), 0) || 0,
          },
          lifecycleStages,
        });
      }

      case 'contacts': {
        const limit = parseInt(searchParams.get('limit') || '100');
        const search = searchParams.get('search');
        
        if (search) {
          return NextResponse.json(await hubspot.searchContacts(search));
        }
        return NextResponse.json(await hubspot.getContacts(limit));
      }

      case 'companies': {
        const limit = parseInt(searchParams.get('limit') || '100');
        return NextResponse.json(await hubspot.getCompanies(limit));
      }

      case 'deals': {
        const limit = parseInt(searchParams.get('limit') || '100');
        return NextResponse.json(await hubspot.getDeals(limit));
      }

      case 'contact': {
        const id = searchParams.get('id');
        if (!id) return NextResponse.json({ error: 'Contact ID required' }, { status: 400 });
        return NextResponse.json(await hubspot.getContact(id));
      }

      case 'company': {
        const id = searchParams.get('id');
        if (!id) return NextResponse.json({ error: 'Company ID required' }, { status: 400 });
        return NextResponse.json(await hubspot.getCompany(id));
      }

      case 'lists': {
        return NextResponse.json({ lists: [] }); // TODO: implement getLists
      }

      case 'owners': {
        return NextResponse.json(await hubspot.getOwners());
      }

      case 'pipelines': {
        return NextResponse.json(await hubspot.getDealPipelines());
      }

      case 'test': {
        // Simple connection test
        const contacts = await hubspot.getContacts(1);
        return NextResponse.json({ 
          connected: true, 
          message: 'HubSpot connection successful',
          contactCount: contacts.total || 0
        });
      }

      default:
        return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
    }
  } catch (error: any) {
    console.error('HubSpot API error:', error);
    return NextResponse.json({ 
      error: error.message,
      connected: false 
    }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const hubspot = getHubSpotClient();
    const body = await request.json();
    const { action, ...data } = body;

    switch (action) {
      case 'createContact': {
        const result = await hubspot.createContact(data.properties);
        return NextResponse.json(result, { status: 201 });
      }

      case 'updateContact': {
        const result = await hubspot.updateContact(data.id, data.properties);
        return NextResponse.json(result);
      }

      case 'createCompany': {
        const result = await hubspot.createCompany(data.properties);
        return NextResponse.json(result, { status: 201 });
      }

      case 'updateCompany': {
        const result = await hubspot.updateCompany(data.id, data.properties);
        return NextResponse.json(result);
      }

      case 'createDeal': {
        const result = await hubspot.createDeal(data.properties);
        return NextResponse.json(result, { status: 201 });
      }

      case 'updateDeal': {
        const result = await hubspot.updateDeal(data.id, data.properties);
        return NextResponse.json(result);
      }

      case 'addNote': {
        const result = await hubspot.createNote(data.contactId, data.body);
        return NextResponse.json(result, { status: 201 });
      }

      case 'addToList': {
        const result = await hubspot.addContactToList(data.listId, data.contactId);
        return NextResponse.json(result);
      }

      default:
        return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
    }
  } catch (error: any) {
    console.error('HubSpot POST error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const hubspot = getHubSpotClient();
    const searchParams = request.nextUrl.searchParams;
    const type = searchParams.get('type');
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json({ error: 'ID required' }, { status: 400 });
    }

    switch (type) {
      case 'contact':
        await hubspot.deleteContact(id);
        return NextResponse.json({ success: true });

      default:
        return NextResponse.json({ error: 'Invalid type' }, { status: 400 });
    }
  } catch (error: any) {
    console.error('HubSpot DELETE error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
