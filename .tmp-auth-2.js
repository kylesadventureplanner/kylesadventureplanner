
      // Keep popup callbacks on a lightweight page to avoid rendering the full app in the auth popup.
      const POPUP_REDIRECT_URI = window.location.origin + '/auth-popup-callback.html';
      const POPUP_ROOT_URI = window.location.origin + '/';

      function isRedirectMismatchError(err) {
        const msg = String(err?.message || err?.errorMessage || '').toLowerCase();
        return msg.includes('aadsts50011') || msg.includes('redirect uri');
      }

      async function loginPopupWithFallback(instance, request) {
        try {
          return await instance.loginPopup({ ...request, redirectUri: POPUP_REDIRECT_URI });
        } catch (err) {
          if (!isRedirectMismatchError(err)) throw err;
          console.warn('⚠️ Popup callback redirect not registered; retrying root redirect URI');
          return await instance.loginPopup({ ...request, redirectUri: POPUP_ROOT_URI });
        }
      }

      // Initialize MSAL instance
     const msalInitPromise = msalInstance.initialize().catch(error => {
       console.error("MSAL initialization failed:", error);
       throw error;
     });

     // Handle redirect from Microsoft login
     msalInitPromise.then(() => {
       if (window.location.search.includes('code=') || window.location.search.includes('error=')) {
         return msalInstance.handleRedirectPromise();
       }
       return Promise.resolve();
     }).catch(error => {
       console.error("⚠️ Error handling redirect:", error);
     });

     // Global auth state variables
     let accessToken = null;
     let activeAccount = null;
     let isConnectedToExcel = false;
     let isSigningIn = false;

     // Define what permissions (scopes) we need from Microsoft
     const loginRequest = {
       scopes: [
         "User.Read",
         "Files.ReadWrite",  // For accessing Excel files in OneDrive
       ],
     };

     function syncAuthGlobals() {
       window.accessToken = accessToken || null;
       window.activeAccount = activeAccount || null;
     }

     // REAL signIn function - Defined HERE so it's immediately available
     async function realSignInImpl() {
       try {
         if (isSigningIn) {
           console.log("⏳ Sign-in already in progress");
           return;
         }

         isSigningIn = true;
         window.showLoading?.('Signing in...');

         await msalInitPromise;
         console.log("✅ MSAL is ready");

         const accounts = msalInstance.getAllAccounts();
         if (accounts.length > 0) {
           console.log("✅ Found existing account, using silent login...");
           msalInstance.setActiveAccount(accounts[0]);
           activeAccount = accounts[0];

           try {
             const tokenResponse = await msalInstance.acquireTokenSilent({
               ...loginRequest,
               account: activeAccount,
             });
             accessToken = tokenResponse.accessToken;
             syncAuthGlobals();
             isConnectedToExcel = true;

             document.getElementById("authStatus").textContent = `Signed in as ${activeAccount.username}`;
             document.getElementById("signInBtn").style.display = "none";
             document.getElementById("signOutBtn").style.display = "inline-block";
             window.updateConnectionStatus?.(true);

             await window.loadTable?.();
             window.loadBikeTable?.();
             window.initFindNearMe?.();
             window.initContextMenu?.();
             window.initRowDetailModal?.();

             window.hideLoading?.();
             window.showToast?.('✓ Successfully signed in!', 'success', 3000);
             isSigningIn = false;
             return;
           } catch (silentError) {
             console.log("⚠️ Silent login failed, will try popup...", silentError.message);
           }
         }

          const loginResponse = await loginPopupWithFallback(msalInstance, loginRequest);
         activeAccount = loginResponse.account;
         msalInstance.setActiveAccount(activeAccount);

         const tokenResponse = await msalInstance.acquireTokenSilent({
           ...loginRequest,
           account: activeAccount,
         });

         accessToken = tokenResponse.accessToken;
         syncAuthGlobals();
         isConnectedToExcel = true;

         document.getElementById("authStatus").textContent = `Signed in as ${activeAccount.username}`;
         document.getElementById("signInBtn").style.display = "none";
         document.getElementById("signOutBtn").style.display = "inline-block";
         window.updateConnectionStatus?.(true);

         await window.loadTable?.();
         window.loadBikeTable?.();
         window.initFindNearMe?.();
         window.initContextMenu?.();
         window.initRowDetailModal?.();

         window.hideLoading?.();
         window.showToast?.('✓ Successfully signed in!', 'success', 3000);
         isSigningIn = false;

       } catch (error) {
         isSigningIn = false;
         window.hideLoading?.();
         console.error("❌ SIGN-IN ERROR:", error.message);

         let userMessage = "Sign-in failed. Check console for details.";
         if (error.name === "BrowserAuthError" && error.code === "popup_window_error") {
           userMessage = "Could not open login popup. Please check if popups are blocked.";
         } else if (error.name === "BrowserAuthError" && error.code === "user_cancelled") {
           userMessage = "Login was cancelled. Please try again.";
         }

         window.showToast?.('✕ ' + userMessage, 'error', 5000);
       }
     }

     // REAL signOut function
     async function realSignOutImpl() {
       window.showLoading?.('Signing out...');
       const account = msalInstance.getActiveAccount();
       if (!account) {
         window.hideLoading?.();
         return;
       }

        await msalInstance.logoutPopup({
         account,
          postLogoutRedirectUri: POPUP_REDIRECT_URI,
       });

       accessToken = null;
       activeAccount = null;
       syncAuthGlobals();
       isConnectedToExcel = false;
       document.getElementById("authStatus").textContent = "Not signed in";
       document.getElementById("signInBtn").style.display = "inline-block";
       document.getElementById("signOutBtn").style.display = "none";
       window.updateConnectionStatus?.(false);
       document.querySelector("#adventureTableBody").innerHTML = "";
       window.clearSelection?.();
       window.hideLoading?.();
       window.showToast?.('✓ Successfully signed out!', 'success', 2000);
     }

     // Override the placeholder with real functions
     window.signIn = realSignInImpl;
     window.signOut = realSignOutImpl;
     window.realSignIn = realSignInImpl;
     window.realSignOut = realSignOutImpl;

     console.log('✅ REAL AUTH FUNCTIONS DEFINED AND READY IMMEDIATELY!');
     console.log('🔐 window.signIn type:', typeof window.signIn);
     console.log('🔐 window.realSignIn type:', typeof window.realSignIn);

     // Also attach directly to buttons to guarantee they work
     setTimeout(() => {
       const signInBtn = document.getElementById('signInBtn');
       const signOutBtn = document.getElementById('signOutBtn');
       if (signInBtn) {
         signInBtn.onclick = function(e) {
           e.preventDefault();
           console.log('🔐 Direct button handler: calling realSignInImpl');
           realSignInImpl();
         };
         console.log('✅ Direct signIn handler attached to button');
       }
       if (signOutBtn) {
         signOutBtn.onclick = function(e) {
           e.preventDefault();
           console.log('🔐 Direct button handler: calling realSignOutImpl');
           realSignOutImpl();
         };
         console.log('✅ Direct signOut handler attached to button');
       }
     }, 100);

     // ============================================================
     // AUTO-LOGIN: Check for existing session on page load
     // ============================================================
     async function checkExistingSessionAndLoadData() {
       try {
         console.log('🔍 Checking for existing session...');

         // Wait for MSAL to initialize
         await msalInitPromise;

         // Check for existing accounts
         const accounts = msalInstance.getAllAccounts();
         console.log(`📊 Found ${accounts.length} existing account(s)`);

         if (accounts.length > 0) {
           console.log('✅ User already logged in, attempting to load data...');
           const account = accounts[0];
           msalInstance.setActiveAccount(account);
           activeAccount = account;

           try {
             // Try to get token silently
             const tokenResponse = await msalInstance.acquireTokenSilent({
               ...loginRequest,
               account: account,
             });

             accessToken = tokenResponse.accessToken;
             syncAuthGlobals();
             isConnectedToExcel = true;

             // Update UI
             document.getElementById('authStatus').textContent = `Signed in as ${account.username}`;
             document.getElementById('signInBtn').style.display = 'none';
             document.getElementById('signOutBtn').style.display = 'inline-block';

             // Update connection status BEFORE loading
             console.log('🔗 Setting connection status to CONNECTED');
             window.updateConnectionStatus?.(true);

             // Load data from Excel
             console.log('📥 Loading adventure data from Excel...');
             await window.loadTable?.();
             window.loadBikeTable?.();

             // Initialize other systems
             window.initFindNearMe?.();
             window.initContextMenu?.();
             window.initRowDetailModal?.();

             console.log('✅ Auto-login successful - data loaded and connection status updated');
           } catch (silentError) {
             console.warn('⚠️ Could not acquire token silently:', silentError.message);
             console.log('ℹ️ User will need to sign in again manually');
             window.updateConnectionStatus?.(false);
           }
         } else {
           console.log('ℹ️ No existing session found');
           window.updateConnectionStatus?.(false);
         }
       } catch (error) {
         console.error('❌ Error checking existing session:', error);
         window.updateConnectionStatus?.(false);
       }
     }

     // Check for existing session when MSAL is ready
     msalInitPromise.then(() => {
       console.log('⏳ MSAL initialized, checking for existing session...');
       checkExistingSessionAndLoadData();
     }).catch(error => {
       console.error('❌ Failed to check session:', error);
       window.updateConnectionStatus?.(false);
     });

     console.log('✅ Auto-login check scheduled for when MSAL is ready');

     // ============================================================
     // LOAD TABLE - Load adventure data from Excel via Microsoft Graph API
     // ============================================================
     window.loadTable = async function() {
       try {
         console.log('📥 loadTable: Starting to load adventure data from Excel...');

         if (!accessToken || !activeAccount) {
           console.error('❌ loadTable: No access token or active account');
           window.showToast?.('❌ Authentication required. Please sign in again.', 'error', 5000);
           return false;
         }

         const filePath = "Copilot_Apps/Kyles_Adventure_Finder/Adventure_Finder_Excel_DB.xlsx";
         const tableName = "MyList";

         // Store globally so saveToExcel can use the same values
         window.filePath = filePath;
         window.tableName = tableName;

         // Build Microsoft Graph API URL
         const encodedPath = encodeURIComponent(filePath);
         const apiUrl = `https://graph.microsoft.com/v1.0/me/drive/root:/${encodedPath}:/workbook/tables/${tableName}/rows`;

         console.log(`📍 Fetching from: ${apiUrl}`);

         // Fetch rows from Excel table
         const response = await fetch(apiUrl, {
           method: 'GET',
           headers: {
             'Authorization': `Bearer ${accessToken}`,
             'Content-Type': 'application/json'
           }
         });

         if (!response.ok) {
           // Provide detailed error information
           let errorMsg = `Excel API error: ${response.status} ${response.statusText}`;

           if (response.status === 403) {
             errorMsg = '403 Forbidden: File path may be incorrect or file not accessible. Check the file location in OneDrive.';
             console.error('🔍 Debug info:');
             console.error('   Expected path:', filePath);
             console.error('   Verify the file exists at: Copilot_Apps/Kyles_Adventure_Finder/Adventure_Finder_Excel_DB.xlsx');
             console.error('   Also verify the table name exists:', tableName);
           } else if (response.status === 404) {
             errorMsg = '404 Not Found: Excel file or table not found. Check the file path and table name.';
           }

           throw new Error(errorMsg);
         }

         const data = await response.json();
         const rows = data.value || [];

         console.log(`✅ Fetched ${rows.length} rows from Excel`);

         // Initialize adventuresData array with proper structure
         window.adventuresData = rows.map((row, index) => ({
           values: [row.values[0] || []],
           rowId: row.id,
           index: index
         }));

         console.log('✅ loadTable: Adventure data ready');
         console.log('📊 Loaded adventures:', window.adventuresData.length);

         // Render the cards to the grid
         await window.renderAdventureCards();

         // Populate autocomplete suggestions with initial data
         console.log('📋 Populating initial autocomplete suggestions...');
         if (typeof populateAutocomplete === 'function') {
           setTimeout(() => populateAutocomplete(), 100);
         }

         // Update connection status to show we're connected to Excel backend
         window.updateConnectionStatus?.(true);

         // Show success message
         window.showToast?.('✅ Adventure data loaded successfully', 'success', 2000);

         return true;
       } catch (error) {
         console.error('❌ loadTable error:', error);
         window.showToast?.(`❌ Failed to load adventure data: ${error.message}`, 'error', 5000);
         return false;
       }
     };

     // ============================================================
     // REFRESH ADVENTURE DATA - Re-fetch Excel data and re-render cards
     // ============================================================
     window.refreshAdventureData = async function() {
       const btn = document.getElementById('adventureRefreshBtn');
       const originalHTML = btn ? btn.innerHTML : '';

       try {
         // If not signed in, trigger sign-in first then reload
         if (!accessToken || !activeAccount) {
           window.showToast?.('🔐 Not signed in – signing in now...', 'info', 3000);
           await window.signIn?.();
           return; // signIn will call loadTable itself
         }

         if (btn) {
           btn.disabled = true;
           btn.innerHTML = '⏳ Refreshing...';
           btn.style.opacity = '0.7';
         }

         window.showToast?.('🔄 Refreshing adventure data from Excel...', 'info', 2000);
         const ok = await window.loadTable?.();

         if (ok !== false) {
           window.showToast?.('✅ Adventure data refreshed!', 'success', 3000);
         }
       } catch (err) {
         console.error('❌ refreshAdventureData error:', err);
         window.showToast?.(`❌ Refresh failed: ${err.message}`, 'error', 5000);
       } finally {
         if (btn) {
           btn.disabled = false;
           btn.innerHTML = originalHTML;
           btn.style.opacity = '';
         }
       }
     };

      // ============================================================
      // RENDER ADVENTURE CARDS - Display loaded data in the grid
      // ============================================================
      // NOTE: This window.renderAdventureCards shim delegates to the real
      // paginated renderer (_paginatedRenderAdventureCards) which is assigned
       // later when the body script block that owns renderAdventureCards executes.
       // At that point window.renderAdventureCards is replaced with the real
       // function, so any call made AFTER page load hits the real implementation
       // directly.  This shim only runs if somehow called before that block fires.
       window.renderAdventureCards = async function(adventuresArray = null) {
         console.log('🎨 window.renderAdventureCards: delegating to paginated renderer...');
         const sourceAdventures = Array.isArray(adventuresArray)
           ? adventuresArray
           : (Array.isArray(window.adventuresData) ? window.adventuresData : []);

         if (sourceAdventures.length === 0) {
           console.warn('⚠️ No adventure data to render');
           return;
         }

         // Set pagination state
         window.totalFilteredAdventures = sourceAdventures.map((row, idx) => ({
           row,
           sourceIndex: idx
         }));
         window.currentPage = 1;
         window.itemsPerPage = 20;

         // Calculate total pages
         const totalPages = Math.ceil(sourceAdventures.length / 20);

         // Show/hide pagination controls based on whether we have more than one page
         const paginationControls = document.getElementById('paginationControls');
         const paginationControlsTop = document.getElementById('paginationControlsTop');
         if (totalPages > 1) {
           if (paginationControls) paginationControls.style.display = 'flex';
           if (paginationControlsTop) paginationControlsTop.style.display = 'flex';
         } else {
           if (paginationControls) paginationControls.style.display = 'none';
           if (paginationControlsTop) paginationControlsTop.style.display = 'none';
         }

         // Delegate to the proper paginated renderer
         if (typeof renderPaginatedCards === 'function') {
           console.log('✅ Calling renderPaginatedCards()...');
           renderPaginatedCards();
         } else {
           console.warn('⚠️ renderPaginatedCards not available yet, rendering inline...');
           // Fallback: render first page inline
           const cardsGrid = document.getElementById('adventureCardsGrid');
           if (!cardsGrid) {
             console.error('❌ cardsGrid not found');
             return;
           }

           console.log(`✅ Rendering ${sourceAdventures.length} cards (fallback inline)`);
           cardsGrid.innerHTML = '';

           // Render first page (20 items) as fallback
           const startIdx = 0;
           const endIdx = Math.min(20, sourceAdventures.length);

           for (let i = startIdx; i < endIdx; i++) {
             const item = window.totalFilteredAdventures[i];
           const row = item.row;
           const sourceIndex = item.sourceIndex;
           const actualIndex = i;
           const values = row.values[0] || [];

           const [
             name, googlePlaceId, website, tags, driveTime,
             hoursOfOperation, activityDuration, difficulty, trailLength,
             state, city, address, phoneNumber, googleRating, cost,
             directions, description, nearby, links, links2, notes, myRating,
             favoriteStatus, googleUrl
           ] = values;

           const stateUpper = String(state || '').trim().toUpperCase();
           const hasPlaceId = googlePlaceId && String(googlePlaceId).trim().length > 0 &&
             googlePlaceId !== 'undefined' && googlePlaceId !== 'null' &&
             googlePlaceId !== 'SKIP' && !String(googlePlaceId).toUpperCase().includes('SKIP');

           // Get feedback block HTML if function is available
           const khFeedbackHtml = typeof window.renderKhFeedbackBlock === 'function'
             ? window.renderKhFeedbackBlock({
                 ratingValue: myRating,
                 favoriteValue: favoriteStatus,
                 visitedValue: values[24],
                 notesValue: notes
               })
             : '';

           // Parse tags using getTagsForPlace function
           const tagList = typeof getTagsForPlace === 'function' ? getTagsForPlace(googlePlaceId, tags) : (tags ? tags.split(',').map(t => t.trim()).filter(Boolean) : []);

           const card = document.createElement("div");
           card.className = "adventure-card";
           card.dataset.cardDomain = 'adventure';
           card.dataset.index = String(actualIndex);
           if (sourceIndex >= 0) {
             card.dataset.sourceIndex = String(sourceIndex);
           }
           card.dataset.googlePlaceId = (googlePlaceId || "").trim();
           card.dataset.state = (state || "").toLowerCase();
           card.dataset.city = (city || "").toLowerCase();
           card.dataset.tags = (tags || "").toLowerCase();
           card.dataset.difficulty = (difficulty || "").toLowerCase();

           card.innerHTML = `
             <div class="adventure-card-header">
               <div class="adventure-card-title">${name || "Unnamed Adventure"}</div>
               ${hasPlaceId ? `
                 <div class="adventure-card-place-id-subtitle" style="font-size: 0.85rem; font-weight: normal; color: #6b7280; margin-top: -4px;">Google Place ID: ${googlePlaceId}</div>
               ` : ''}
               <div class="adventure-card-location">
                 <span class="location-icon">📍</span>
                 <span>${city || "Unknown"}${state ? ', ' + stateUpper : ''}</span>
               </div>
               ${driveTime ? `
                 <div class="adventure-card-time">
                   <span class="time-icon">🚗</span>
                   <span>${driveTime}</span>
                 </div>
               ` : ''}
             </div>

             ${tagList.length > 0 ? `
               <div class="adventure-card-tags">
                 ${tagList.map(tag => {
           const tagClass = tag.toLowerCase().replace(/[^a-z0-9]+/g, '-');
           return `<span class="tag-pill tag-${tagClass}" data-tag="${tag}">${tag}</span>`;
         }).join('')}
               </div>
             ` : ''}

             <div class="adventure-card-body">
               ${description ? `<div class="card-description">${description}</div>` : ''}
               ${hoursOfOperation ? `
                 <div class="card-info-row">
                   <span class="card-info-icon">🕐</span>
                   <span class="card-info-label">Hours:</span>
                   <span class="card-info-value">${hoursOfOperation}</span>
                 </div>
               ` : ''}
               ${difficulty ? `
                 <div class="card-info-row">
                   <span class="card-info-icon">⚡</span>
                   <span class="card-info-label">Difficulty:</span>
                   <span class="card-info-value">${difficulty}</span>
                 </div>
               ` : ''}
               ${cost ? `
                 <div class="card-info-row">
                   <span class="card-info-icon">💰</span>
                   <span class="card-info-label">Cost:</span>
                   <span class="card-info-value">${cost}</span>
                 </div>
               ` : ''}
               ${khFeedbackHtml}
             </div>

             <div class="adventure-card-footer" style="padding: 10px 16px; background: #f8fafc; border-top: 1px solid #e5e7eb; display:flex; align-items:center; justify-content:space-between; gap:8px;">
               <div style="font-size: 12px; color: #64748b;">Click card to open details</div>
             </div>
           `;

           cardsGrid.appendChild(card);
           }

           console.log(`✅ Successfully rendered ${endIdx - startIdx} cards (fallback)`);

           // Show pagination if needed
           if (sourceAdventures.length > 20) {
             const paginationControls = document.getElementById('paginationControls');
             if (paginationControls) {
               paginationControls.style.display = 'flex';
             }
           }
         }
       };



     // ============================================================
     // TOGGLE FAVORITE - Handle favorite button clicks
     // ============================================================
     window.toggleCardFavorite = function(index, event, cardElement) {
       try {
         const adventureId = cardElement?.dataset.adventureId;
         if (!adventureId) {
           console.warn('⚠️ No adventure ID found');
           return;
         }

         // Get current favorites from localStorage
         const favorites = JSON.parse(localStorage.getItem('adventureFavorites') || '[]');
         const btn = event.target.closest('.card-favorite-btn');

         if (favorites.includes(adventureId)) {
           // Remove from favorites
           favorites.splice(favorites.indexOf(adventureId), 1);
           btn.textContent = '🤍';
           btn.classList.remove('active');
           window.showToast?.('Removed from favorites', 'info', 2000);
         } else {
           // Add to favorites
           favorites.push(adventureId);
           btn.textContent = '💖';
           btn.classList.add('active');
           window.showToast?.('Added to favorites', 'success', 2000);
         }

         // Save to localStorage
         localStorage.setItem('adventureFavorites', JSON.stringify(favorites));

       } catch (error) {
         console.error('❌ toggleCardFavorite error:', error);
       }
     };

     // Store real implementations for placeholder functions to call
     window._realToggleCardFavorite = window.toggleCardFavorite;
     window._realSetAdventureRating = window.setAdventureRating;

     // ============================================================
     // SET ADVENTURE RATING - Handle star rating clicks
     // ============================================================
     window.setAdventureRating = function(index, rating, cardElement) {
       try {
         const adventureId = cardElement?.dataset.adventureId;
         if (!adventureId) {
           console.warn('⚠️ No adventure ID found');
           return;
         }

         // Get current ratings from localStorage
         const ratings = JSON.parse(localStorage.getItem('adventureRatings') || '{}');

         // Update rating
         ratings[adventureId] = rating;
         localStorage.setItem('adventureRatings', JSON.stringify(ratings));

         // Update visual stars
         const stars = cardElement?.querySelectorAll('.rating-star');
         stars?.forEach((star, idx) => {
           if (idx + 1 <= rating) {
             star.classList.add('filled');
           } else {
             star.classList.remove('filled');
           }
         });

         window.showToast?.(`Rated ${rating} stars`, 'success', 2000);

       } catch (error) {
         console.error('❌ setAdventureRating error:', error);
       }
     };

     // Update the real implementation reference
     window._realSetAdventureRating = window.setAdventureRating;

     // ============================================================
     // SAVE TO EXCEL - Update adventure data in Excel
     // ============================================================
     window.saveToExcel = async function(rowId, updatedValues, retryCount = 0) {
       try {
         if (!accessToken) {
           console.error('❌ No access token available for Excel write');
           throw new Error('User not authenticated. Please sign in.');
         }

         const filePath = "Copilot_Apps/Kyles_Adventure_Finder/Adventure_Finder_Excel_DB.xlsx";
         const tableName = "MyList";
         const encodedPath = encodeURIComponent(filePath);

         // Build update request body
         const requestBody = {
           values: [updatedValues]
         };

         // Update row in Excel table
         const apiUrl = `https://graph.microsoft.com/v1.0/me/drive/root:/${encodedPath}:/workbook/tables/${tableName}/rows/${rowId}`;

         console.log(`📝 Saving to Excel: ${apiUrl}`);

         const response = await fetch(apiUrl, {
           method: 'PATCH',
           headers: {
             'Authorization': `Bearer ${accessToken}`,
             'Content-Type': 'application/json'
           },
           body: JSON.stringify(requestBody)
         });

         if (!response.ok) {
           // If 401, token may have expired
           if (response.status === 401 && retryCount === 0) {
             console.log('🔄 Token expired, attempting refresh...');
             try {
               const tokenResponse = await msalInstance.acquireTokenSilent({
                 ...loginRequest,
                 account: activeAccount,
                 forceRefresh: true
               });
               accessToken = tokenResponse.accessToken;
               syncAuthGlobals();
               // Retry once with refreshed token
               return await window.saveToExcel(rowId, updatedValues, 1);
             } catch (refreshError) {
               console.error('Token refresh failed:', refreshError);
             }
           }
           throw new Error(`Failed to save to Excel: ${response.status}`);
         }

         console.log('✅ Successfully saved to Excel');
         window.showToast?.('✅ Changes saved to Excel', 'success', 2000);
         return true;

       } catch (error) {
         console.error('❌ saveToExcel error:', error);
          throw error;
        }
      };
     // End of MSAL/auth helper script block
    