// Enhanced element waiting with mutation observer
function enhancedWaitForElement(selector, callback, timeout = 10000) {
  const startTime = Date.now();
  
  // First try immediate check
  const immediateCheck = document.getElementById(selector);
  if (immediateCheck) {
    callback(immediateCheck);
    return;
  }

  // Set up mutation observer
  const observer = new MutationObserver(() => {
    const element = document.getElementById(selector);
    if (element) {
      observer.disconnect();
      callback(element);
    } else if (Date.now() - startTime > timeout) {
      observer.disconnect();
      console.error(`Element "${selector}" not found after ${timeout}ms`);
    }
  });

  // Observe the entire document
  observer.observe(document, {
    childList: true,
    subtree: true
  });

  // Fallback: interval check
  const interval = setInterval(() => {
    const element = document.getElementById(selector);
    if (element) {
      clearInterval(interval);
      observer.disconnect();
      callback(element);
    } else if (Date.now() - startTime > timeout) {
      clearInterval(interval);
      observer.disconnect();
      console.error(`Element "${selector}" not found after ${timeout}ms`);
    }
  }, 200);
}

// Select both IT categories and locations
function selectFilters() {
  try {
    // Select IT categories
    const catSelect = document.getElementById("lstCategory");
    const locSelect = document.getElementById("lstLoc");
    
    if (!catSelect || !locSelect) {
      console.error("Required select elements not found");
      if (!catSelect) console.error("lstCategory missing");
      if (!locSelect) console.error("lstLoc missing");
      return;
    }

    // Values for IT-related categories (including new categories)
    const itCategoryValues = ["10", "11", "66", "104", "108", "17", "18", "1", "19"]; // Added Office Equipment categories
    let selectedCatCount = 0;

    // Select matching IT options
    itCategoryValues.forEach(value => {
      try {
        const option = catSelect.querySelector(`option[value="${value}"]`);
        if (option) {
          option.selected = true;
          selectedCatCount++;
          console.log(`Selected category: ${value} - ${option.textContent.trim()}`);
        } else {
          console.warn(`Category option not found: ${value}`);
        }
      } catch (e) {
        console.error(`Error selecting category option ${value}:`, e);
      }
    });

    // Values for locations by region
    const locationValues = [
      // North
      "18", // Cagayan
      "37", // Isabela - ADDED ISABELA
      
      // West
      "38", // Kalinga
      "50", // Mountain Province
      "33", // Ifugao
      
      // South
      "55", // Nueva Vizcaya
      "62", // Quirino
      "8"   // Aurora
    ];
    
    const locationNames = {
      "18": "Cagayan (North)",
      "37": "Isabela (North)", // ADDED ISABELA
      "38": "Kalinga (West)",
      "50": "Mountain Province (West)",
      "33": "Ifugao (West)",
      "55": "Nueva Vizcaya (South)",
      "62": "Quirino (South)",
      "8": "Aurora (South)"
    };

    let selectedLocCount = 0;

    // Clear previous selections first
    Array.from(locSelect.options).forEach(opt => opt.selected = false);

    // Select matching location options
    locationValues.forEach(value => {
      try {
        const option = locSelect.querySelector(`option[value="${value}"]`);
        if (option) {
          option.selected = true;
          selectedLocCount++;
          console.log(`Selected location: ${value} - ${locationNames[value] || option.textContent.trim()}`);
        } else {
          console.warn(`Location option not found: ${value} (${locationNames[value]})`);
        }
      } catch (e) {
        console.error(`Error selecting location option ${value}:`, e);
      }
    });

    console.log(`Successfully selected:
    - ${selectedCatCount} IT categories
    - ${selectedLocCount} locations across North, West, and South regions`);
    
    // Dispatch change events if needed
    if (selectedCatCount > 0) {
      catSelect.dispatchEvent(new Event('change', { bubbles: true }));
    }
    if (selectedLocCount > 0) {
      locSelect.dispatchEvent(new Event('change', { bubbles: true }));
    }
  } catch (error) {
    console.error("Error in selectFilters:", error);
  }
}

// Main execution flow
function initializeExtension() {
  console.log("PhilGEPS Extension initialized for URL:", window.location.href);
  
  // Check if we're on a relevant page
  if (!window.location.href.includes("OpportunitiesDetailedSearchUI.aspx")) {
    console.log("Not on detailed search page. Current page:", window.location.href);
    return;
  }

  // Enhanced element waiting for both selects
  Promise.all([
    new Promise(resolve => enhancedWaitForElement("lstCategory", resolve)),
    new Promise(resolve => enhancedWaitForElement("lstLoc", resolve))
  ]).then(() => {
    selectFilters();
  }).catch(error => {
    console.error("Error waiting for elements:", error);
  });

  // Handle ASP.NET partial postbacks
  if (window.Sys && Sys.WebForms && Sys.WebForms.PageRequestManager) {
    const prm = Sys.WebForms.PageRequestManager.getInstance();
    prm.add_endRequest(() => {
      console.log("Partial postback detected, reselecting filters...");
      selectFilters();
    });
  }

  // Additional safety check after 5 seconds
  setTimeout(() => {
    const catSelect = document.getElementById("lstCategory");
    const locSelect = document.getElementById("lstLoc");
    if (!catSelect || !locSelect) {
      console.warn("Final check: Required elements still not found");
      if (!catSelect) console.warn("lstCategory missing");
      if (!locSelect) console.warn("lstLoc missing");
    }
  }, 5000);
}

// Start the extension
if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", initializeExtension);
} else {
  initializeExtension();
}