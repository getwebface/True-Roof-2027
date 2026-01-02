/**
 * GOOGLE APPS SCRIPT SETUP
 * 
 * Copy and paste the following code into your Google Sheet's Script Editor
 * (Extensions > Apps Script) to initialize the backend database.
 */

function setupFullDatabase() {
  setupGlobalSheet();
  setupPagesSheet();
  setupLeadsSheet();
  setupSignalsSheet();
}

function setupGlobalSheet() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  let sheet = ss.getSheetByName('global') || ss.insertSheet('global');
  
  const headers = ['key', 'value', 'description'];
  
  sheet.getRange(1, 1, 1, headers.length)
    .setValues([headers])
    .setBackground('#cfe2f3') // Light Blue
    .setFontWeight('bold');
    
  // Add some default values if empty
  if (sheet.getLastRow() === 1) {
    const navJson = JSON.stringify([
      { "label": "Home", "href": "/" },
      { "label": "Services", "href": "/services" },
      { "label": "Service Areas", "href": "/areas/bondi" }
    ]);

    sheet.getRange(2, 1, 3, 3).setValues([
      ['companyName', 'Gen Roof Tiling', 'Main Brand Name'],
      ['phone', '1300 ROOF GEN', 'Primary Contact'],
      ['navigation', navJson, 'Main Menu Structure']
    ]);
  }
}

function setupPagesSheet() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  let sheet = ss.getSheetByName('pages') || ss.insertSheet('pages');
  
  // Added last_optimized and last_mutation for Genkit tracking
  const headers = ['slug', 'meta_title', 'meta_description', 'layout', 'components', 'theme_overrides', 'last_optimized', 'last_mutation'];
  
  sheet.getRange(1, 1, 1, headers.length)
    .setValues([headers])
    .setBackground('#d9ead3') // Light Green
    .setFontWeight('bold');

  // SEED DATA: Populate Row 2 with the "Champion" Version if empty
  if (sheet.getLastRow() === 1) {
    const row2Data = getInitialHomepageSeed();
    sheet.getRange(2, 1, 1, row2Data.length).setValues([row2Data]);
    Logger.log("Seeded Row 2 with Champion Homepage content.");
  }
}

function setupLeadsSheet() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  let sheet = ss.getSheetByName('leads') || ss.insertSheet('leads');
  
  const headers = ['created_at', 'name', 'phone', 'email', 'source', 'url'];
  
  sheet.getRange(1, 1, 1, headers.length)
    .setValues([headers])
    .setBackground('#f4cccc') // Light Red
    .setFontWeight('bold');
}

function setupSignalsSheet() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  let signalsSheet = ss.getSheetByName('signals') || ss.insertSheet('signals');
  
  const headers = ['timestamp', 'path', 'type', 'metadata'];
  
  // Initialize Header Row with Styles
  signalsSheet.getRange(1, 1, 1, headers.length)
    .setValues([headers])
    .setBackground('#ffd966') // Construction Yellow
    .setFontWeight('bold');
    
  Logger.log("Database initialized successfully.");
}

/**
 * Generates the JSON string payload for the Initial Homepage (Row 2)
 */
function getInitialHomepageSeed() {
  const slug = "/";
  const metaTitle = "Gen Roof Tiling - AI Optimized Restoration";
  const metaDescription = "Experience the future of roofing. AI leak detection and premium restoration services.";
  
  const layout = JSON.stringify([
    "hero_main",
    "stats_bar",
    "features_grid",
    "reviews_marquee",
    "cta_footer"
  ]);

  const components = JSON.stringify({
    "hero_main": {
      "id": "hero_main",
      "type": "hero_magic",
      "props": {
        "headline": "Roofing. Evolved.",
        "subheadline": "We use thermal imaging drones and AI analysis to guarantee a leak-free home for 10 years.",
        "ctaText": "Get AI Assessment"
      }
    },
    "stats_bar": {
      "id": "stats_bar",
      "type": "stats_bar",
      "props": {
        "stats": [
          { "label": "Leaks Fixed", "value": "12,000+" },
          { "label": "Avg Response", "value": "55 min" },
          { "label": "Warranty", "value": "10 Years" }
        ]
      }
    },
    "features_grid": {
      "id": "features_grid",
      "type": "bento_grid",
      "props": {
        "title": "Why Choose Gen?",
        "items": [
          { "title": "Precision Reports", "description": "You get a digital twin of your roof.", "colSpan": 2 },
          { "title": "Transparent Pricing", "description": "AI calculated materials. No waste.", "colSpan": 1 },
          { "title": "Licensed Pros", "description": "Master builders only.", "colSpan": 1 }
        ]
      }
    },
    "reviews_marquee": {
      "id": "reviews_marquee",
      "type": "trust_marquee",
      "props": {
        "reviews": [
          { "name": "Sarah J.", "text": "They found a leak 3 other plumbers missed.", "rating": 5 },
          { "name": "Mike D.", "text": "The digital report was insane. Great work.", "rating": 5 },
          { "name": "Estate Co.", "text": "Our go-to for strata repairs.", "rating": 5 }
        ]
      }
    },
    "cta_footer": {
      "id": "cta_footer",
      "type": "lead_form_split",
      "props": {
        "title": "Future-proof your home.",
        "subtitle": "Join the waitlist for our next availability window."
      }
    }
  });

  const themeOverrides = JSON.stringify({
    "primaryColor": "221.2 83.2% 53.3%" // Standard Blue
  });

  const lastOptimized = new Date().toISOString();
  const lastMutation = "init_seed_v1";

  return [slug, metaTitle, metaDescription, layout, components, themeOverrides, lastOptimized, lastMutation];
}
