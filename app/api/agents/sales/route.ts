export const dynamic = 'force-dynamic';
// ============================================================================
// SALES AGENT API - Real HubSpot Data
// ============================================================================

import { NextRequest, NextResponse } from 'next/server';
import { getHubSpotClient } from '@/lib/hubspot';
import { analyzePipeline, generateCallPrep, scoreLeads } from '@/lib/openai';

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const action = searchParams.get('action') || 'dashboard';

  try {
    const hubspot = getHubSpotClient();

    switch (action) {
      case 'dashboard': {
        const dashboard = await hubspot.getDashboard();
        return NextResponse.json(dashboard);
      }

      case 'contacts': {
        const limit = parseInt(searchParams.get('limit') || '50');
        const contacts = await hubspot.getContacts(limit);
        return NextResponse.json(contacts);
      }

      case 'contact': {
        const id = searchParams.get('id');
        if (!id) return NextResponse.json({ error: 'Contact ID required' }, { status: 400 });
        const contact = await hubspot.getContact(id);
        return NextResponse.json(contact);
      }

      case 'companies': {
        const limit = parseInt(searchParams.get('limit') || '50');
        const companies = await hubspot.getCompanies(limit);
        return NextResponse.json(companies);
      }

      case 'deals': {
        const limit = parseInt(searchParams.get('limit') || '50');
        const deals = await hubspot.getDeals(limit);
        return NextResponse.json(deals);
      }

      case 'pipelines': {
        const pipelines = await hubspot.getDealPipelines();
        return NextResponse.json(pipelines);
      }

      case 'owners': {
        const owners = await hubspot.getOwners();
        return NextResponse.json(owners);
      }

      case 'lifecycle-stages': {
        const stages = await hubspot.getContactsByLifecycleStage();
        return NextResponse.json(stages);
      }

      case 'search': {
        const query = searchParams.get('q') || '';
        const results = await hubspot.searchContacts(query);
        return NextResponse.json(results);
      }

      default:
        return NextResponse.json({ error: 'Unknown action' }, { status: 400 });
    }
  } catch (error: any) {
    console.error('Sales API error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to fetch data' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  const body = await request.json();
  const { action } = body;

  try {
    const hubspot = getHubSpotClient();

    switch (action) {
      case 'analyze-pipeline': {
        const dashboard = await hubspot.getDashboard();
        const analysis = await analyzePipeline({
          totalDeals: dashboard.totalDeals,
          pipelineValue: dashboard.pipelineValue,
          wonValue: dashboard.wonValue,
          dealsByStage: dashboard.dealsByStage,
        });
        return NextResponse.json({ analysis });
      }

      case 'call-prep': {
        const { contactId } = body;
        if (!contactId) return NextResponse.json({ error: 'Contact ID required' }, { status: 400 });
        
        const contact = await hubspot.getContact(contactId);
        // Get company and deals if available
        const brief = await generateCallPrep(contact.properties, null, []);
        return NextResponse.json({ brief, contact: contact.properties });
      }

      case 'score-leads': {
        const contacts = await hubspot.getContacts(20);
        const scores = await scoreLeads(contacts.results || []);
        return NextResponse.json({ scores });
      }

      case 'create-contact': {
        const { properties } = body;
        const contact = await hubspot.createContact(properties);
        return NextResponse.json(contact);
      }

      case 'update-contact': {
        const { contactId, properties } = body;
        const contact = await hubspot.updateContact(contactId, properties);
        return NextResponse.json(contact);
      }

      case 'create-deal': {
        const { properties } = body;
        const deal = await hubspot.createDeal(properties);
        return NextResponse.json(deal);
      }

      case 'create-note': {
        const { contactId, note } = body;
        const result = await hubspot.createNote(contactId, note);
        return NextResponse.json(result);
      }

      case 'create-task': {
        const { contactId, subject, dueDate } = body;
        const result = await hubspot.createTask(contactId, subject, dueDate);
        return NextResponse.json(result);
      }

      default:
        return NextResponse.json({ error: 'Unknown action' }, { status: 400 });
    }
  } catch (error: any) {
    console.error('Sales API error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to process request' },
      { status: 500 }
    );
  }
}
