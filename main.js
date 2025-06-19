// Global function for status color mapping - INLINE STYLES VERSION
function getStatusColors(status) {
    // Normalize the status string to handle any whitespace/encoding issues
    const normalizedStatus = (status || '').trim().toLowerCase();

    // Return inline style strings with !important to override Tailwind CSS
    const colorMap = {
        'wysłano cv': 'background-color: #dbeafe !important; color: #1e40af !important; border: 2px solid #3b82f6 !important;',
        'rozmowa telefoniczna': 'background-color: #fef3c7 !important; color: #92400e !important; border: 2px solid #f59e0b !important;',
        'rozmowa online': 'background-color: #fef3c7 !important; color: #92400e !important; border: 2px solid #f59e0b !important;',
        'rozmowa stacjonarna': 'background-color: #fef3c7 !important; color: #92400e !important; border: 2px solid #f59e0b !important;',
        'oferta': 'background-color: #dcfce7 !important; color: #166534 !important; border: 2px solid #22c55e !important;',
        'odrzucono': 'background-color: #fee2e2 !important; color: #dc2626 !important; border: 2px solid #ef4444 !important;',
        'odrzucona': 'background-color: #fee2e2 !important; color: #dc2626 !important; border: 2px solid #ef4444 !important;',
        'odrzucony': 'background-color: #fee2e2 !important; color: #dc2626 !important; border: 2px solid #ef4444 !important;',
        'odrzucone': 'background-color: #fee2e2 !important; color: #dc2626 !important; border: 2px solid #ef4444 !important;'
    };

    // Direct match first
    if (colorMap[normalizedStatus]) {
        return colorMap[normalizedStatus];
    }

    // Fallback with partial matching
    if (normalizedStatus.includes('rozmowa')) {
        return 'background-color: #fef3c7 !important; color: #92400e !important; border: 2px solid #f59e0b !important;';
    } else if (normalizedStatus.includes('oferta')) {
        return 'background-color: #dcfce7 !important; color: #166534 !important; border: 2px solid #22c55e !important;';
    } else if (normalizedStatus.includes('odrzucon')) {
        return 'background-color: #fee2e2 !important; color: #dc2626 !important; border: 2px solid #ef4444 !important;';
    }

    // Default fallback
    return 'background-color: #f3f4f6 !important; color: #374151 !important; border: 2px solid #6b7280 !important;';
}


// Make loadApplications globally available
window.loadApplications = loadApplications;
window.getFilters = getFilters;
window.clearAllFilters = clearAllFilters;

// Global function for refreshing applications with current filters
window.refreshApplications = function() {
    console.log('🔄 Manual refresh triggered');
    const sortOrder = document.getElementById('sortOrder')?.value || 'desc';
    const showArchived = document.getElementById('showArchived')?.checked || false;
    loadApplications(getFilters(), showArchived, sortOrder);
};

// Debug function for real-time listener status
window.checkListenerStatus = function() {
    console.log('=== REAL-TIME LISTENER STATUS ===');
    console.log('Current listener exists:', !!window.currentApplicationsListener);
    console.log('User authenticated:', !!window.auth?.currentUser);
    console.log('Firebase modules available:', !!window.firebaseModules);
    console.log('onSnapshot function available:', typeof window.firebaseModules?.onSnapshot);
    console.log('=================================');
    return {
        hasListener: !!window.currentApplicationsListener,
        isAuthenticated: !!window.auth?.currentUser,
        hasFirebase: !!window.firebaseModules
    };
};

// Helper to normalize strings for reliable comparisons
function normalizeText(str) {
    return (str || '')
        .toLowerCase()
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')
        .replace(/ł/g, 'l')
        .replace(/Ł/g, 'l')
        .trim();
}

// Global array to keep track of images currently displayed in the edit modal
let currentEditImages = [];



function showImagesPreview(images) {
    const preview = document.getElementById('editImagesPreview');

    if (!preview) {
        console.error('editImagesPreview element not found!');
        return;
    }

    preview.innerHTML = '';

    if (!images || !Array.isArray(images) || images.length === 0) {
        preview.innerHTML = '<p style="color: #6b7280; font-size: 0.8em; margin: 0.5em 0;">Brak zdjęć</p>';
        currentEditImages = [];
        return;
    }

    // Store current images globally
    currentEditImages = [...images];

    images.forEach((imageItem, index) => {
        const container = document.createElement('div');
        container.className = 'image-preview-container';
        container.style.position = 'relative';
        container.style.display = 'inline-block';
        container.style.margin = '0.25rem';

        const img = document.createElement('img');
        let imageUrl = '';
        let imageName = `Zdjęcie ${index + 1}`;

        // Handle both old Firebase Storage URLs and new Base64 objects
        if (typeof imageItem === 'string') {
            // Old format: direct URL string
            imageUrl = imageItem;
            img.src = imageItem;
        } else if (imageItem && imageItem.data) {
            // New format: Base64 object with data property
            imageUrl = imageItem.data;
            img.src = imageItem.data;
            if (imageItem.name) {
                imageName = imageItem.name;
            }
        } else {
            console.warn('Invalid image format:', imageItem);
            return;
        }

        img.style.maxWidth = '80px';
        img.style.maxHeight = '80px';
        img.style.borderRadius = '6px';
        img.style.border = '1px solid #e5e7eb';
        img.style.cursor = 'pointer';
        img.title = `${imageName} - kliknij aby powiększyć`;
        img.className = 'image-preview';

        // Add error handling for broken images
        img.onerror = function () {
            console.error(`Failed to load image: ${imageUrl}`);
            this.style.border = '2px solid #dc2626';
            this.title = `Błąd ładowania: ${imageName}`;
            this.alt = 'Błąd ładowania';
        };

        // Add click to preview larger image in modal
        img.onclick = function () {
            if (typeof window.openImageModal === 'function') {
                window.openImageModal(imageUrl, imageName);
            } else {
                // Fallback: open in a new tab if modal script is missing
                window.open(imageUrl, '_blank', 'noopener,noreferrer');
            }
        };

        // Create delete button
        const deleteBtn = document.createElement('button');
        deleteBtn.className = 'image-remove-btn';
        deleteBtn.innerHTML = '<i class="fas fa-times"></i>';
        deleteBtn.type = 'button';
        deleteBtn.title = 'Usuń zdjęcie';
        deleteBtn.style.position = 'absolute';
        deleteBtn.style.top = '-5px';
        deleteBtn.style.right = '-5px';
        deleteBtn.style.background = '#dc3545';
        deleteBtn.style.color = 'white';
        deleteBtn.style.border = 'none';
        deleteBtn.style.borderRadius = '50%';
        deleteBtn.style.width = '20px';
        deleteBtn.style.height = '20px';
        deleteBtn.style.fontSize = '12px';
        deleteBtn.style.cursor = 'pointer';
        deleteBtn.style.display = 'flex';
        deleteBtn.style.alignItems = 'center';
        deleteBtn.style.justifyContent = 'center';
        deleteBtn.style.boxShadow = '0 2px 4px rgba(0, 0, 0, 0.2)';
        deleteBtn.style.transition = 'all 0.2s ease';

        deleteBtn.onmouseover = function () {
            this.style.background = '#c82333';
            this.style.transform = 'scale(1.1)';
        };

        deleteBtn.onmouseout = function () {
            this.style.background = '#dc3545';
            this.style.transform = 'scale(1)';
        };

        deleteBtn.onclick = function (e) {
            e.stopPropagation(); // Prevent triggering image preview
            removeImageFromEdit(index);
        };

        container.appendChild(img);
        container.appendChild(deleteBtn);
        preview.appendChild(container);
    });
}

// Function to remove image from edit modal
function removeImageFromEdit(index) {
    if (currentEditImages && currentEditImages.length > index) {
        currentEditImages.splice(index, 1);
        showImagesPreview(currentEditImages);

        // Show feedback message
        const editMessage = document.getElementById('editFormMessage');
        if (editMessage) {
            editMessage.textContent = 'Zdjęcie usunięte (nie zapomnij zapisać zmian)';
            editMessage.style.color = 'orange';

            // Clear message after 3 seconds
            setTimeout(() => {
                if (editMessage.textContent.includes('usunięte')) {
                    editMessage.textContent = '';
                }
            }, 3000);
        }
    }
}
function loadFavorites() {
    const favoritesContent = document.getElementById('favoritesContent');
    if (!favoritesContent) return;

    const user = window.auth.currentUser;
    if (!user) {
        favoritesContent.innerHTML = '<p class="text-gray-500">Musisz się zalogować, aby zobaczyć ulubione.</p>';
        return;
    }

    const q = window.firebaseModules.query(
        window.firebaseModules.collection(db, "applications"),
        window.firebaseModules.where("userId", "==", user.uid),
        window.firebaseModules.where("favorite", "==", true),
        window.firebaseModules.where("archiwalna", "==", false),
        window.firebaseModules.orderBy("data", "desc")
    );

    window.firebaseModules.getDocs(q).then((querySnapshot) => {
        if (querySnapshot.empty) {
            favoritesContent.innerHTML = '<p class="text-gray-500">Brak ulubionych aplikacji.</p>';
            return;
        }

        let html = '<div class="grid gap-4">';
        querySnapshot.forEach((doc) => {
            const app = doc.data();
            let wynagrodzenieText = "";
            if (app.wynagrodzenieOd != null && app.wynagrodzenieDo != null) {
                wynagrodzenieText = `${app.wynagrodzenieOd}-${app.wynagrodzenieDo} ${app.waluta || "PLN"}`;
            } else if (app.wynagrodzenie) {
                wynagrodzenieText = `${app.wynagrodzenie} ${app.waluta || "PLN"}`;
            }
            if (wynagrodzenieText && app.wynRodzaj) {
                wynagrodzenieText += ` ${app.wynRodzaj}`;
            }

            html += `
                    <div class="bg-white border border-gray-200 rounded-lg p-4 shadow-sm">
                        <div class="flex items-start justify-between">
                            <div class="flex-1">
                                <h3 class="font-semibold text-lg text-gray-900 flex items-center gap-2">
                                    <i class="fas fa-star text-yellow-400"></i>
                                    ${app.stanowisko}
                                </h3>
                                <p class="text-gray-600">${app.firma}</p>
                                <p class="text-sm text-gray-500">Data: ${app.data}</p>
                                <div class="inline-flex items-center px-2 py-1 rounded-lg text-xs font-medium mb-1" style="${getStatusColors(app.status)}">
                                    ${app.status}
                                </div>
                                ${wynagrodzenieText ? `<p class="text-sm text-gray-500">Wynagrodzenie: ${wynagrodzenieText}</p>` : ''}
                            </div>
                            <button class="edit-btn-fav text-blue-600 hover:text-blue-800" data-id="${doc.id}">
                                <i class="fas fa-edit"></i>
                            </button>
                        </div>
                    </div>
                `;
        });
        html += '</div>';
        favoritesContent.innerHTML = html;

        // Add event listeners for edit buttons in favorites
        document.querySelectorAll('.edit-btn-fav').forEach(btn => {
            btn.addEventListener('click', function (e) {
                e.preventDefault();
                e.stopPropagation();

                const appId = this.getAttribute('data-id');
                console.log('=== FAVORITES EDIT BUTTON CLICKED ===');
                console.log('Button element:', this);
                console.log('App ID from data-id:', appId);

                if (!appId) {
                    console.error('ERROR: No app ID found on favorites button!');
                    alert('Błąd: Brak ID aplikacji na przycisku ulubionych!');
                    return;
                }

                console.log('Calling openEditModal from favorites with ID:', appId);
                try {
                    openEditModal(appId);
                } catch (error) {
                    console.error('ERROR calling openEditModal from favorites:', error);
                    alert('Błąd podczas otwierania formularza edycji z ulubionych: ' + error.message);
                }
                console.log('=== FAVORITES EDIT BUTTON CLICK HANDLED ===');
            });
        });
    });
}

async function openEditModal(appId) {
    console.log('=== openEditModal called ===');
    console.log('App ID:', appId);
    console.log('Current user:', window.auth?.currentUser);
    console.log('Firebase modules available:', !!window.firebaseModules);

    const user = window.auth.currentUser;
    if (!user) {
        console.log('User not authenticated - showing alert');
        alert("Musisz być zalogowany!");
        return;
    }

    const docRef = window.firebaseModules.doc(db, "applications", appId);
    const docSnap = await window.firebaseModules.getDoc(docRef);
    if (!docSnap.exists()) {
        alert("Aplikacja nie istnieje!");
        return;
    }

    const app = docSnap.data();

    // SECURITY CHECK: Verify user owns this application
    if (app.userId !== user.uid) {
        alert("Nie masz uprawnień do edycji tej aplikacji!");
        return;
    }

    document.getElementById('editAppId').value = appId;
    document.getElementById('editStanowisko').value = app.stanowisko;
    document.getElementById('editFirma').value = app.firma;
    document.getElementById('editData').value = app.data;
    document.getElementById('editStatus').value = app.status || "";

    // Obsługa wynagrodzenia - sprawdź typ
    const salaryType = app.salaryType || 'exact';
    document.getElementById('editSalaryType').value = salaryType;

    if (salaryType === 'exact') {
        document.getElementById('editWynagrodzenie').value = app.wynagrodzenie || "";
        document.getElementById('editWynagrodzenieOd').value = "";
        document.getElementById('editWynagrodzenieDo').value = "";
    } else {
        document.getElementById('editWynagrodzenie').value = "";
        document.getElementById('editWynagrodzenieOd').value = app.wynagrodzenieOd || "";
        document.getElementById('editWynagrodzenieDo').value = app.wynagrodzenieDo || "";
    }

    // Wywołaj funkcję przełączania pól
    if (window.toggleEditSalaryFields) {
        window.toggleEditSalaryFields();
    }

    document.getElementById('editWaluta').value = app.waluta || "PLN";
    document.getElementById('editWynRodzaj').value = app.wynRodzaj || "BRUTTO";
    document.getElementById('editTryb').value = app.tryb || "STACJONARNY";
    document.getElementById('editRodzaj').value = app.rodzaj || "PELNY_ETAT";
    document.getElementById('editUmowa').value = app.umowa || "UMOWA_O_PRACE";
    document.getElementById('editKontakt').value = app.kontakt || "";
    document.getElementById('editLink').value = app.link || "";
    document.getElementById('editNotatki').value = app.notatki || "";
    document.getElementById('editFavorite').checked = app.favorite || false;

    // Debug: Log application data;;

    // Pokaz podgląd zdjęć
    currentEditImages = [...(app.images || [])]; // Store in global array
    showImagesPreview(currentEditImages);
    document.getElementById('editImages').value = "";

    // Historia statusu
    const historyBox = document.getElementById('statusHistoryBox');
    const historyList = document.getElementById('statusHistoryList');
    historyList.innerHTML = "";
    if (app.statusHistory && app.statusHistory.length > 0) {
        app.statusHistory.forEach(h => {
            const li = document.createElement('li');
            li.textContent = `${h.status} (${h.date})`;
            historyList.appendChild(li);
        });
        historyBox.style.display = "block";
    } else {
        historyBox.style.display = "none";
    }

    document.getElementById('editApplicationForm').dataset.prevStatus = app.status || "";
    document.getElementById('editApplicationForm').dataset.statusHistory = JSON.stringify(app.statusHistory || []);

    console.log('About to show edit modal...');
    const editModal = document.getElementById('editModal');
    console.log('Edit modal element:', editModal);
    console.log('Edit modal current classes:', editModal?.className);

    if (!editModal) {
        console.error('CRITICAL ERROR: Edit modal not found in DOM!');
        alert('Błąd: Modal edycji nie został znaleziony!');
        return;
    }

    // Show the modal
    console.log('Opening modal...');
    editModal.classList.add('active');
    editModal.style.display = 'flex';
    editModal.style.visibility = 'visible';

    console.log('Edit modal classes after adding active:', editModal?.className);
    console.log('Edit modal computed display:', window.getComputedStyle(editModal).display);

    // Force scroll to top of modal when opened
    editModal.scrollTop = 0;

    console.log('=== openEditModal completed ===');
}

// Debounce mechanism to prevent multiple simultaneous calls to loadApplications
let isLoadingApplications = false;
let pendingLoadApplicationsCall = null;

function loadApplications(filters = {}, showArchived = false, sortOrder = 'desc') {
    console.log('=== LOAD APPLICATIONS CALLED ===');
    console.log('loadApplications called with sortOrder:', sortOrder);
    console.log('loadApplications called with filters:', filters);
    console.log('loadApplications called with showArchived:', showArchived);
    console.log('Currently loading:', isLoadingApplications);
    console.log('Call stack:', new Error().stack);
    console.log('=================================');

    // Prevent multiple simultaneous calls
    if (isLoadingApplications) {
        console.log('⏳ loadApplications already running, queuing this call...');
        clearTimeout(pendingLoadApplicationsCall);
        pendingLoadApplicationsCall = setTimeout(() => {
            loadApplications(filters, showArchived, sortOrder);
        }, 100);
        return;
    }
    
    isLoadingApplications = true;

    const user = window.auth.currentUser;
    console.log('User in loadApplications:', user);
    if (!user) {
        console.log('No user - showing login prompt');
        ;
        // Update counters to 0 when no user is logged in
        updateStatusCounters([]);

        // Provide user feedback that filters require authentication
        const tbody = document.querySelector('.applications-table tbody');
        if (tbody) {
            tbody.innerHTML = `
                <tr>
                    <td colspan="6" style="text-align: center; padding: 2rem; color: #6b7280;">
                        <div style="display: flex; flex-direction: column; align-items: center; gap: 1rem;">
                            <i class="fas fa-lock" style="font-size: 2rem; color: #f59e0b;"></i>
                            <div>
                                <h3 style="margin: 0; color: #374151;">Wymagana autoryzacja</h3>
                                <p style="margin: 0.5rem 0 0 0;">Aby używać filtrów i przeglądać aplikacje, <a href="login.html" style="color: #3b82f6; text-decoration: underline;">zaloguj się</a>.</p>
                            </div>
                        </div>
                    </td>
                </tr>
            `;
        }
        isLoadingApplications = false; // Reset flag for no-user case
        return;
    };

    // Clean up previous listener if it exists
    if (window.currentApplicationsListener) {
        console.log('🧹 Cleaning up previous real-time listener');
        window.currentApplicationsListener();
        window.currentApplicationsListener = null;
    }

    let q = window.firebaseModules.query(
        window.firebaseModules.collection(db, "applications"),
        window.firebaseModules.where("userId", "==", user.uid)
    );

    // Use real-time listener instead of one-time getDocs for automatic updates
    console.log('🔄 Setting up real-time listener for user:', user.uid);
    console.log('🔄 Query:', q);
    console.log('🔄 onSnapshot function available:', typeof window.firebaseModules.onSnapshot);

    const unsubscribe = window.firebaseModules.onSnapshot(q, (querySnapshot) => {
        console.log('📡 Real-time update received:', querySnapshot.size, 'applications');
        console.log('📡 QuerySnapshot metadata:', querySnapshot.metadata);
        console.log('📡 Is from cache:', querySnapshot.metadata.fromCache);
        console.log('📡 Has pending writes:', querySnapshot.metadata.hasPendingWrites);

        // Log individual documents for debugging
        querySnapshot.docChanges().forEach((change) => {
            if (change.type === "added") {
                console.log("🆕 New application: ", change.doc.data());
                // Show a brief notification for new applications (not from cache)
                if (!querySnapshot.metadata.fromCache) {
                    console.log("✨ This is a real-time addition, not from cache!");
                }
            }
            if (change.type === "modified") {
                console.log("✏️ Modified application: ", change.doc.data());
            }
            if (change.type === "removed") {
                console.log("🗑️ Removed application: ", change.doc.data());
            }
        });

        const tbody = document.querySelector('.applications-table tbody');
        if (!tbody) {
            console.error('❌ Table body not found!');
            return;
        }

        tbody.innerHTML = '';
        let count = 0;
        let applications = [];

        querySnapshot.forEach((doc) => {
            const app = doc.data();
            app.id = doc.id;
            applications.push(app);
            console.log('📄 Application loaded:', app.stanowisko, app.firma, app.data);
        });

        console.log('📊 Total applications loaded:', applications.length);;

        // Update status counters before filtering
        updateStatusCounters(applications);

        // Sort applications based on sortOrder
        console.log('=== SORTING SECTION ===');
        console.log('Sorting applications, sortOrder:', sortOrder);
        console.log('Number of applications to sort:', applications.length);
        console.log('Applications before sort:', applications.map(a => ({ firma: a.firma, data: a.data, favorite: a.favorite })));

        applications.sort((a, b) => {
            console.log(`Comparing: ${a.firma} (${a.data}, fav: ${a.favorite}) vs ${b.firma} (${b.data}, fav: ${b.favorite})`);

            // First sort by favorites
            if (a.favorite && !b.favorite) {
                console.log('  -> a is favorite, b is not: a comes first');
                return -1;
            }
            if (!a.favorite && b.favorite) {
                console.log('  -> b is favorite, a is not: b comes first');
                return 1;
            }

            // Then sort by date
            const dateA = new Date(a.data);
            const dateB = new Date(b.data);

            // Debug date parsing
            console.log(`  -> Comparing dates: ${a.data} (${dateA.toISOString()}) vs ${b.data} (${dateB.toISOString()})`);

            if (sortOrder === 'asc') {
                const result = dateA - dateB; // oldest first
                console.log(`  -> ASC sort result: ${result} (${result < 0 ? 'a first' : result > 0 ? 'b first' : 'equal'})`);
                return result;
            } else {
                const result = dateB - dateA; // newest first
                console.log(`  -> DESC sort result: ${result} (${result < 0 ? 'a first' : result > 0 ? 'b first' : 'equal'})`);
                return result;
            }
        });

        console.log('=== SORT COMPLETED ===');
        console.log('Applications after sort:', applications.map(a => ({ firma: a.firma, data: a.data, favorite: a.favorite })));
        console.log('Final sort order verification:');
        applications.forEach((app, index) => {
            console.log(`  ${index + 1}. ${app.favorite ? '⭐' : ''} ${app.firma} - ${app.data}`);
        });
        console.log('=====================');

        applications.forEach((app) => {
            if (!showArchived && app.archiwalna === true) {
                console.log(`⏭️ Skipping archived application: ${app.stanowisko} at ${app.firma}`);
                return;
            }

            let match = true;
            console.log(`🔍 Checking filters for: ${app.stanowisko} at ${app.firma}`);
            console.log(`📋 Current filters:`, filters);
            
            for (const key in filters) {
                if (filters[key]) {
                    console.log(`🔎 Checking filter "${key}": "${filters[key]}" against app value: "${app[key]}"`);
                    
                    // Special handling for "Rozmowy" status filter
                    if (key === 'status' && filters[key] === 'Rozmowy') {
                        const interviewStatuses = ['Rozmowa telefoniczna', 'Rozmowa online', 'Rozmowa stacjonarna'];
                        if (!interviewStatuses.includes(app.status)) {
                            console.log(`❌ Filter failed: "${app.status}" not in interview statuses`);
                            match = false;
                            break;
                        } else {
                            console.log(`✅ Filter passed: "${app.status}" is interview status`);
                        }
                    }
                    // Special handling for "Odrzucono" status filter
                    else if (key === 'status' && filters[key] === 'Odrzucono') {
                        const rejectedVariants = ['odrzucono', 'odrzucony', 'odrzucona', 'odrzucone'];
                        if (!app.status || !rejectedVariants.some(v => app.status.toLowerCase().includes(v))) {
                            console.log(`❌ Filter failed: "${app.status}" not rejected status`);
                            match = false;
                            break;
                        } else {
                            console.log(`✅ Filter passed: "${app.status}" is rejected status`);
                        }
                    }
                    // Special handling for "Wysłano CV" and "Oferty" status filters
                    else if (key === 'status' && filters[key] === 'Wysłano CV') {
                        if (normalizeText(app.status) !== 'wyslano cv') {
                            console.log(`❌ Filter failed: "${app.status}" normalized to "${normalizeText(app.status)}" != "wyslano cv"`);
                            match = false;
                            break;
                        } else {
                            console.log(`✅ Filter passed: "${app.status}" matches "Wysłano CV"`);
                        }
                    }
                    else if (key === 'status' && filters[key] === 'Oferty') {
                        if (!app.status || !normalizeText(app.status).includes('oferta')) {
                            console.log(`❌ Filter failed: "${app.status}" doesn't contain "oferta"`);
                            match = false;
                            break;
                        } else {
                            console.log(`✅ Filter passed: "${app.status}" contains "oferta"`);
                        }
                    } else if (Array.isArray(filters[key])) {
                        // Handle multi-select filters (arrays)
                        const multiSelectFields = ['tryb', 'rodzaj', 'umowa'];
                        if (multiSelectFields.includes(key) && filters[key].length > 0) {
                            if (!filters[key].includes(app[key])) {
                                match = false;
                                break;
                            }
                        }
                    } else if (typeof app[key] === "string" && typeof filters[key] === "string") {
                        // For exact match fields like rodzaj, umowa, tryb - use strict equality
                        const exactMatchFields = ['rodzaj', 'umowa', 'tryb'];
                        if (exactMatchFields.includes(key)) {
                            if (app[key] !== filters[key]) {
                                match = false;
                                break;
                            }
                        } else {
                            // For text fields like stanowisko, firma - use includes
                            if (!app[key]?.toLowerCase().includes(filters[key].toLowerCase())) {
                                match = false;
                                break;
                            }
                        }
                    } else if (key === 'dateFrom') {
                        // Handle date range "from" filter
                        if (filters[key]) {
                            let compareDate;
                            if (filters.dateFieldType === 'status' && app.statusHistory && app.statusHistory.length > 0) {
                                // Use current status date (last in statusHistory)
                                const lastStatus = app.statusHistory[app.statusHistory.length - 1];
                                compareDate = lastStatus.date || app.data; // fallback to application date
                            } else {
                                // Use application date
                                compareDate = app.data;
                            }

                            const appDate = new Date(compareDate);
                            const filterDate = new Date(filters[key]);
                            if (appDate < filterDate) {
                                match = false;
                                break;
                            }
                        }
                    } else if (key === 'dateTo') {
                        // Handle date range "to" filter
                        if (filters[key]) {
                            let compareDate;
                            if (filters.dateFieldType === 'status' && app.statusHistory && app.statusHistory.length > 0) {
                                // Use current status date (last in statusHistory)
                                const lastStatus = app.statusHistory[app.statusHistory.length - 1];
                                compareDate = lastStatus.date || app.data; // fallback to application date
                            } else {
                                // Use application date
                                compareDate = app.data;
                            }

                            const appDate = new Date(compareDate);
                            const filterDate = new Date(filters[key]);
                            if (appDate > filterDate) {
                                match = false;
                                break;
                            }
                        }
                    } else if (key === 'data') {
                        // Handle exact date filter
                        if (filters[key]) {
                            let compareDate;
                            if (filters.dateFieldType === 'status' && app.statusHistory && app.statusHistory.length > 0) {
                                // Use current status date (last in statusHistory)
                                const lastStatus = app.statusHistory[app.statusHistory.length - 1];
                                compareDate = lastStatus.date || app.data; // fallback to application date
                            } else {
                                // Use application date
                                compareDate = app.data;
                            }

                            if (compareDate !== filters[key]) {
                                match = false;
                                break;
                            }
                        }
                    } else if (filters[key] && app[key] != filters[key]) {
                        match = false;
                        break;
                    }
                }
            }
            
            if (!match) {
                console.log(`❌ Application "${app.stanowisko}" at "${app.firma}" FILTERED OUT`);
                return;
            } else {
                console.log(`✅ Application "${app.stanowisko}" at "${app.firma}" PASSED all filters`);
            }

            count++;

            let lastStatusDate = "";
            if (app.statusHistory && app.statusHistory.length > 0) {
                const last = app.statusHistory[app.statusHistory.length - 1];
                lastStatusDate = last.date ? ` (${last.date})` : "";
            }

            let wynagrodzenieCell = "";
            if (app.wynagrodzenieOd != null && app.wynagrodzenieDo != null) {
                wynagrodzenieCell = `${app.wynagrodzenieOd}-${app.wynagrodzenieDo} ${app.waluta || "PLN"}`;
            } else if (app.wynagrodzenie) {
                wynagrodzenieCell = app.wynagrodzenie + " " + (app.waluta || "PLN");
            }
            if (wynagrodzenieCell && app.wynRodzaj) {
                wynagrodzenieCell += " " + app.wynRodzaj;
            }

            // Funkcje do konwersji wartości na czytelny tekst
            const getRodzajText = (rodzaj) => {
                switch (rodzaj) {
                    case 'PELNY_ETAT': return 'Pełny etat';
                    case 'NIEPELNY_ETAT': return 'Niepełny etat';
                    case 'STAZ': return 'Staż';
                    default: return rodzaj || '';
                }
            };

            const getUmowaText = (umowa) => {
                switch (umowa) {
                    case 'UMOWA_O_PRACE': return 'Umowa o pracę';
                    case 'UMOWA_B2B': return 'Umowa B2B';
                    case 'UMOWA_ZLECENIE': return 'Umowa zlecenie';
                    default: return umowa || '';
                }
            };

            const getTrybText = (tryb) => {
                switch (tryb) {
                    case 'STACJONARNY': return 'Stacjonarny';
                    case 'HYBRYDOWY': return 'Hybrydowy';
                    case 'ZDALNY': return 'Zdalny';
                    default: return tryb || '';
                }
            };

            const tr = document.createElement('tr');
            tr.className = 'border-t border-t-[#e5e7eb] bg-white hover:bg-gray-50';

            // Add archived class if application is archived
            if (app.archiwalna === true) {
                tr.classList.add('archived');
            }
            // Add image indicator 
            const imageIndicator = (app.images && app.images.length > 0)
                ? `<i class="fas fa-camera text-blue-500" style="font-size: 0.7em; margin-left: 4px;" title="${app.images.length} zdjęć"></i>`
                : '';

            tr.innerHTML = `
    <td class="px-4 py-2 text-[#141414] text-sm font-normal leading-normal min-w-[150px]" data-label="Stanowisko">
        <div class="flex items-center gap-2">
            ${app.favorite ? '<i class="fas fa-star text-yellow-400" style="font-size: 0.8em;"></i>' : ''}
            <span>${window.sanitizeHTML(app.stanowisko)}</span>
            ${imageIndicator}
        </div>
    </td>
    <td class="px-4 py-2 text-gray-600 text-sm font-normal leading-normal min-w-[120px]" data-label="Firma">${window.sanitizeHTML(app.firma)}</td>
    <td class="px-4 py-2 text-gray-600 text-sm font-normal leading-normal min-w-[100px]" data-label="Data">${app.data}</td>
    <td class="px-4 py-2 text-sm font-normal leading-normal min-w-[120px]" data-label="Status">
        <button class="flex min-w-[84px] max-w-[480px] cursor-pointer items-center justify-center overflow-hidden rounded-lg h-8 px-4 text-sm font-medium leading-normal w-full" style="${getStatusColors(app.status)}">
            <span class="truncate">${window.sanitizeHTML(app.status)}${lastStatusDate}</span>
        </button>
    </td>
    <td class="px-4 py-2 text-gray-600 text-sm font-normal leading-normal min-w-[120px]" data-label="Wynagrodzenie">${window.sanitizeHTML(wynagrodzenieCell)}</td>
    <td class="px-4 py-2 text-gray-600 text-sm font-normal leading-normal min-w-[100px]" data-label="Tryb">${getTrybText(app.tryb)}</td>
    <td class="px-4 py-2 text-gray-600 text-sm font-normal leading-normal min-w-[100px]" data-label="Rodzaj">${getRodzajText(app.rodzaj)}</td>
    <td class="px-4 py-2 text-gray-600 text-sm font-normal leading-normal min-w-[100px]" data-label="Umowa">${getUmowaText(app.umowa)}</td>
    <td class="px-4 py-2 text-center min-w-[100px]">
        <button class="edit-btn px-3 py-1 rounded bg-[#141414] text-white hover:bg-[#2d2d2d] transition-colors text-sm" data-id="${app.id}">
            <i class="fas fa-edit"></i> Edytuj
        </button>
    </td>
`;
            tbody.appendChild(tr);
        });

        const thead = document.querySelector('.applications-table thead');
        const tableContainer = document.querySelector('#applicationsCard .table-responsive');
        const messageEl = document.getElementById('noApplicationsMessage');

        if (count === 0) {
            if (thead) thead.style.display = 'none';
            if (tableContainer) tableContainer.style.display = 'none';
            if (messageEl) {
                const message = filters.status ? 'Brak aplikacji o tym statusie' : 'Brak aplikacji';
                messageEl.textContent = message;
                messageEl.style.display = 'block';
            }
        } else {
            if (thead) thead.style.display = '';
            if (tableContainer) tableContainer.style.display = '';
            if (messageEl) messageEl.style.display = 'none';
        }

        document.querySelectorAll('.edit-btn').forEach(btn => {
            console.log('Adding event listener to edit button:', btn.getAttribute('data-id'));

            // Force white text color on all mouse events
            btn.addEventListener('mousedown', function (e) {
                this.style.color = 'white';
                this.style.setProperty('color', 'white', 'important');
                const icon = this.querySelector('.fas');
                if (icon) {
                    icon.style.color = 'white';
                    icon.style.setProperty('color', 'white', 'important');
                }
            });

            btn.addEventListener('mouseup', function (e) {
                this.style.color = 'white';
                this.style.setProperty('color', 'white', 'important');
                const icon = this.querySelector('.fas');
                if (icon) {
                    icon.style.color = 'white';
                    icon.style.setProperty('color', 'white', 'important');
                }
            });

            btn.addEventListener('click', function (e) {
                e.preventDefault();
                e.stopPropagation();

                // Ensure color stays white during click
                this.style.color = 'white';
                this.style.setProperty('color', 'white', 'important');
                const icon = this.querySelector('.fas');
                if (icon) {
                    icon.style.color = 'white';
                    icon.style.setProperty('color', 'white', 'important');
                }

                const appId = this.getAttribute('data-id');
                console.log('=== EDIT BUTTON CLICKED ===');
                console.log('Button element:', this);
                console.log('App ID from data-id:', appId);
                console.log('Button innerHTML:', this.innerHTML);
                console.log('Event target:', e.target);
                console.log('Current target:', e.currentTarget);

                if (!appId) {
                    console.error('ERROR: No app ID found on button!');
                    alert('Błąd: Brak ID aplikacji na przycisku!');
                    return;
                }

                console.log('Calling openEditModal with ID:', appId);
                try {
                    openEditModal(appId);
                } catch (error) {
                    console.error('ERROR calling openEditModal:', error);
                    alert('Błąd podczas otwierania formularza edycji: ' + error.message);
                }
                console.log('=== EDIT BUTTON CLICK HANDLED ===');
            });
        });

        // Auto-fix colors after table is rendered
        autoFixColors();

        // Enhance table row visuals
        setTimeout(() => {
            enhanceTableRowVisuals();
        }, 100);
    }, (error) => {
        console.error('Real-time listener error:', error);
        // Fallback to one-time query if real-time fails
        window.firebaseModules.getDocs(q).then((querySnapshot) => {
            console.log('Fallback to one-time query, found:', querySnapshot.size, 'applications');
            // Use the same processing logic as above...
            const tbody = document.querySelector('.applications-table tbody');
            if (tbody) {
                tbody.innerHTML = '<tr><td colspan="6" style="text-align: center; padding: 2rem; color: #6b7280;">Błąd ładowania danych. Odśwież stronę.</td></tr>';
            }
        }).catch((fallbackError) => {
            console.error('Fallback query also failed:', fallbackError);
            const tbody = document.querySelector('.applications-table tbody');
            if (tbody) {
                tbody.innerHTML = '<tr><td colspan="6" style="text-align: center; padding: 2rem; color: #dc2626;">Błąd połączenia z bazą danych.</td></tr>';
            }
        });
    });

    // Store the unsubscribe function globally for cleanup if needed
    console.log('💾 Storing new real-time listener unsubscribe function');
    window.currentApplicationsListener = unsubscribe;
    
    // Reset loading flag
    isLoadingApplications = false;
    console.log('✅ loadApplications completed, flag reset');
}

function autoFixColors() {
    // Simple fix that runs after table is loaded to ensure colors are applied
    setTimeout(() => {
        const buttons = document.querySelectorAll('td[data-label="Status"] button');
        buttons.forEach(button => {
            const statusText = button.textContent.trim().replace(/\s*\([^)]*\)\s*$/, '');
            const styles = getStatusColors(statusText);
            if (!button.getAttribute('style') || !button.getAttribute('style').includes('!important')) {
                button.setAttribute('style', styles);
            }
        });
    }, 500);
}

// Enhanced visual status indicators for table rows
function enhanceTableRowVisuals() {
    const rows = document.querySelectorAll('.applications-table tbody tr');

    rows.forEach(row => {
        const statusButton = row.querySelector('td[data-label="Status"] button');
        if (!statusButton) return;

        const statusText = statusButton.textContent.trim().split('(')[0].trim(); // Remove date part

        // Add days since application indicator for stale applications
        const dateCell = row.querySelector('td[data-label="Data"]');
        if (dateCell) {
            const dateText = dateCell.textContent.trim();
            const applicationDate = new Date(dateText);
            const now = new Date();
            const daysDiff = Math.floor((now - applicationDate) / (1000 * 60 * 60 * 24));

            if (daysDiff > 14 && statusText === 'Wysłano CV') {
                // Add indicator for applications older than 2 weeks without response
                const staleIndicator = document.createElement('div');
                staleIndicator.innerHTML = `<span style="color: #dc2626; font-size: 0.75rem; font-weight: 600;">(${daysDiff} dni)</span>`;
                staleIndicator.title = 'Długo bez odpowiedzi';
                dateCell.appendChild(staleIndicator);
            }
        }
    });
}

document.addEventListener('DOMContentLoaded', function () {
    console.log('=== DOMContentLoaded FIRED ===');

    // Check for page visibility changes to refresh data when user returns
    document.addEventListener('visibilitychange', function () {
        if (!document.hidden && window.auth && window.auth.currentUser) {
            console.log('Page became visible, refreshing applications...');
            const sortOrder = document.getElementById('sortOrder')?.value || 'desc';
            loadApplications(getFilters(), document.getElementById('showArchived')?.checked, sortOrder);
        }
    });

    // Check if user returned from add-application page
    if (document.referrer && document.referrer.includes('add-application.html')) {
        console.log('User returned from add-application page, refreshing data...');
        setTimeout(() => {
            if (window.auth && window.auth.currentUser) {
                const sortOrder = document.getElementById('sortOrder')?.value || 'desc';
                loadApplications(getFilters(), document.getElementById('showArchived')?.checked, sortOrder);
            }
        }, 500);
    }

    // Wait for Firebase to be ready
    function waitForFirebase(callback) {
        console.log('⏳ Waiting for Firebase...');
        console.log('   - window.firebaseModules:', !!window.firebaseModules);
        console.log('   - window.auth:', !!window.auth);
        console.log('   - onSnapshot available:', !!window.firebaseModules?.onSnapshot);

        if (window.firebaseModules && window.auth && window.firebaseModules.onSnapshot) {
            console.log('✅ Firebase ready!');
            callback();
        } else {
            console.log('⏳ Firebase not ready yet, retrying in 100ms...');
            setTimeout(() => waitForFirebase(callback), 100);
        }
    }

    // Logout button functionality
    const logoutBtn = document.getElementById('logoutBtn');
    if (logoutBtn) {
        logoutBtn.addEventListener('click', function () {
            if (window.firebaseModules && window.firebaseModules.signOut && window.auth) {
                window.firebaseModules.signOut(window.auth).then(() => {
                    window.location.reload();
                }).catch((error) => {
                    console.error('Logout error:', error);
                    // Still reload the page to clear the session
                    window.location.reload();
                });
            } else {
                // Fallback: just reload the page to clear any cached state
                window.location.reload();
            }
        });
    }

    // Toggle filters functionality
    const toggleFiltersButton = document.getElementById('toggleFilters');
    const filtersContainer = document.getElementById('filtersContainer');

    if (toggleFiltersButton && filtersContainer) {
        toggleFiltersButton.addEventListener('click', function () {
            const isHidden = filtersContainer.style.display === 'none';
            filtersContainer.style.display = isHidden ? 'block' : 'none';
            toggleFiltersButton.innerHTML = isHidden ? '<i class="fas fa-filter"></i> Ukryj filtry' : '<i class="fas fa-filter"></i> Pokaż filtry';
        });
    }

    // Close edit modal button handler - ensure DOM is ready with multiple fallbacks
    function setupCloseModalHandler() {
        const closeEditModalBtn = document.getElementById('closeEditModal');
        if (closeEditModalBtn) {
            console.log('✅ Setting up close modal handler');

            // Remove any existing onclick handler first
            closeEditModalBtn.onclick = null;

            // Add the onclick handler
            closeEditModalBtn.onclick = function (e) {
                console.log('🔴 Close button clicked!');
                e.preventDefault();
                e.stopPropagation();

                const editModal = document.getElementById('editModal');
                const editFormMessage = document.getElementById('editFormMessage');

                if (editModal) {
                    console.log('Closing modal...');
                    editModal.classList.remove('active');
                    editModal.style.display = 'none'; // Force hide

                    if (editFormMessage) {
                        editFormMessage.textContent = '';
                    }

                    console.log('Modal closed. Classes:', editModal.className);
                } else {
                    console.error('❌ Edit modal not found when trying to close');
                }
            };

            console.log('Close button handler set successfully');
            return true;
        } else {
            console.warn('❌ closeEditModal button not found in DOM');
            return false;
        }
    }

    // Helper to trigger Google sign-in using Firebase popup
    async function triggerGoogleSignIn(button, statusElement) {
        console.log('🔐 Starting Google sign-in');

        const originalText = button?.innerHTML;
        if (button) {
            button.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Logowanie...';
            button.disabled = true;
        }

        try {
            if (!window.auth) {
                throw new Error('Firebase auth not initialized');
            }

            const { GoogleAuthProvider, signInWithPopup } = await import('https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js');

            const provider = new GoogleAuthProvider();
            const result = await signInWithPopup(window.auth, provider);

            console.log('✅ Successful sign in:', result.user.email);
            if (button) {
                button.innerHTML = '<i class="fas fa-check"></i> Zalogowano!';
            }
        } catch (error) {
            console.error('❌ Sign in error:', error);

            if (button) {
                button.innerHTML = originalText;
                button.disabled = false;
            }

            if (statusElement) {
                let errorMessage = 'Błąd logowania';
                if (error.code === 'auth/popup-closed-by-user') {
                    errorMessage = 'Logowanie anulowane';
                } else if (error.code === 'auth/popup-blocked') {
                    errorMessage = 'Popup zablokowany';
                } else if (error.code === 'auth/unauthorized-domain') {
                    errorMessage = 'Domena nieautoryzowana';
                }
                statusElement.textContent = errorMessage;
                statusElement.style.color = '#dc2626';
                setTimeout(() => {
                    statusElement.textContent = '';
                    statusElement.style.color = '';
                }, 3000);
            }

            setTimeout(() => {
                if (confirm('Logowanie przez Google nie powiodło się. Czy chcesz przejść do strony logowania?')) {
                    window.location.href = 'login.html';
                }
            }, 1000);
        } finally {
            if (button) button.disabled = false;
        }
    }

    // Setup login button handler
    function setupLoginButtonHandler() {
        const loginBtn = document.getElementById('loginBtn');
        if (loginBtn) {
            console.log('✅ Setting up login button handler');

            // Remove any existing onclick handler first
            loginBtn.onclick = null;

            // Add the onclick handler
            loginBtn.onclick = function (e) {
                console.log('🔐 Login button clicked in header');
                e.preventDefault();
                e.stopPropagation();

                triggerGoogleSignIn(loginBtn);
            };

            console.log('Login button handler set successfully');
            return true;
        } else {
            console.warn('❌ loginBtn button not found in DOM');
            return false;
        }
    }

    // Try to setup immediately
    if (!setupCloseModalHandler()) {
        // If failed, try again after a short delay
        setTimeout(setupCloseModalHandler, 100);

        // And try again after a longer delay as final fallback
        setTimeout(setupCloseModalHandler, 500);
    }

    // Setup login button handler
    if (!setupLoginButtonHandler()) {
        // If failed, try again after a short delay
        setTimeout(setupLoginButtonHandler, 100);

        // And try again after a longer delay as final fallback
        setTimeout(setupLoginButtonHandler, 500);
    }

    // Enhanced Escape key listener for edit modal
    document.addEventListener('keydown', function (e) {
        if (e.key === 'Escape' || e.keyCode === 27) {
            const editModal = document.getElementById('editModal');
            if (editModal && editModal.classList.contains('active')) {
                console.log('🔴 Escape key pressed - closing modal');

                editModal.classList.remove('active');
                editModal.style.display = 'none'; // Force hide

                const editFormMessage = document.getElementById('editFormMessage');
                if (editFormMessage) {
                    editFormMessage.textContent = '';
                }

                e.preventDefault();
                e.stopPropagation();
            }
        }
    });

    // Base64 image conversion utility
    function convertFileToBase64(file) {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.onload = () => resolve(reader.result);
            reader.onerror = error => reject(error);
            reader.readAsDataURL(file);
        });
    }

    // Use global array to store current images in edit modal

    // Obsługa uploadu zdjęć - Base64 version
    let uploadedImages = [];
    document.getElementById('editImages').addEventListener('change', async function (e) {
        debugImageUpload('Upload started', { fileCount: e.target.files.length });

        const files = Array.from(e.target.files);
        if (!files.length) {
            debugImageUpload('No files selected');
            return;
        }

        const user = window.auth.currentUser;
        if (!user) {
            debugImageUpload('ERROR: User not logged in');
            alert("Musisz być zalogowany!");
            return;
        }

        const appId = document.getElementById('editAppId').value;
        debugImageUpload('Upload attempt', { userId: user.uid, appId: appId, fileCount: files.length });

        try {
            // SECURITY CHECK: Verify user owns this application before uploading
            const docRef = window.firebaseModules.doc(db, "applications", appId);
            const docSnap = await window.firebaseModules.getDoc(docRef);
            if (!docSnap.exists() || docSnap.data().userId !== user.uid) {
                debugImageUpload('ERROR: User does not own application');
                alert("Nie masz uprawnień do dodawania zdjęć do tej aplikacji!");
                return;
            }

            document.getElementById('editFormMessage').textContent = "Trwa konwersja zdjęć...";
            document.getElementById('editFormMessage').style.color = "blue";

            uploadedImages = [];
            let successCount = 0;
            let errorCount = 0;

            for (let i = 0; i < files.length; i++) {
                const file = files[i];
                try {
                    // Validate file type
                    if (!file.type.startsWith('image/')) {
                        console.warn(`Skipping non-image file: ${file.name}`);
                        errorCount++;
                        continue;
                    }

                    // Check file size (max 1MB for Base64)
                    if (file.size > 1024 * 1024) {
                        console.warn(`File too large: ${file.name}`);
                        alert(`Plik ${file.name} jest za duży (maksymalnie 1MB dla Base64).`);
                        errorCount++;
                        continue;
                    }

                    debugImageUpload(`Converting file ${i + 1}/${files.length}`, { fileName: file.name, size: file.size });
                    document.getElementById('editFormMessage').textContent = `Konwersja zdjęcia ${i + 1}/${files.length}...`;

                    const base64String = await convertFileToBase64(file);
                    const imageData = {
                        name: file.name,
                        type: file.type,
                        size: file.size,
                        data: base64String
                    };

                    uploadedImages.push(imageData);
                    successCount++;

                    debugImageUpload(`Successfully converted file ${i + 1}`, { name: file.name });

                } catch (fileError) {
                    console.error(`Error converting file ${file.name}:`, fileError);
                    errorCount++;
                }
            }

            // Add new images to the global currentEditImages array
            uploadedImages.forEach(imageData => {
                currentEditImages.push(imageData);
            });

            // Update preview with all images
            showImagesPreview(currentEditImages);

            // Show results
            if (successCount > 0 && errorCount === 0) {
                document.getElementById('editFormMessage').textContent = `✅ Skonwertowano ${successCount} zdjęć (nie zapomnij zapisać zmian)!`;
                document.getElementById('editFormMessage').style.color = "green";
            } else if (successCount > 0 && errorCount > 0) {
                document.getElementById('editFormMessage').textContent = `⚠️ Skonwertowano ${successCount} zdjęć, ${errorCount} błędów (nie zapomnij zapisać zmian)!`;
                document.getElementById('editFormMessage').style.color = "orange";
            } else {
                document.getElementById('editFormMessage').textContent = `❌ Nie udało się skonwertować żadnego zdjęcia.`;
                document.getElementById('editFormMessage').style.color = "red";
            }

        } catch (error) {
            console.error('Upload error:', error);
            document.getElementById('editFormMessage').textContent = `❌ Błąd podczas konwersji: ${error.message}`;
            document.getElementById('editFormMessage').style.color = "red";
        }
    });

    // Walidacja pól Stanowisko i Firma w formularzu edycji - tylko litery
    function validateLettersOnly(input) {
        const regex = /[^a-zA-ZąćęłńóśźżĄĆĘŁŃÓŚŹŻ\s]/g;
        input.value = input.value.replace(regex, '');
    }

    const editStanowiskoField = document.getElementById('editStanowisko');
    const editFirmaField = document.getElementById('editFirma');

    if (editStanowiskoField) {
        editStanowiskoField.addEventListener('input', function () {
            validateLettersOnly(this);
        });
    }

    if (editFirmaField) {
        editFirmaField.addEventListener('input', function () {
            validateLettersOnly(this);
        });
    }

    document.getElementById('editApplicationForm').addEventListener('submit', async function (e) {
        e.preventDefault();

        const user = window.auth.currentUser;
        if (!user) {
            alert("Musisz być zalogowany!");
            return;
        }

        const appId = document.getElementById('editAppId').value;

        // SECURITY CHECK: Verify user owns this application before updating
        const docRef = window.firebaseModules.doc(db, "applications", appId);
        const docSnap = await window.firebaseModules.getDoc(docRef);
        if (!docSnap.exists() || docSnap.data().userId !== user.uid) {
            alert("Nie masz uprawnień do edycji tej aplikacji!");
            return;
        }

        const stanowisko = document.getElementById('editStanowisko').value;
        const firma = document.getElementById('editFirma').value;
        const data = document.getElementById('editData').value;
        const status = document.getElementById('editStatus').value;

        // Obsługa wynagrodzenia - sprawdź typ
        const salaryType = document.getElementById('editSalaryType').value;
        let wynagrodzenie = '';
        let wynagrodzenieOd = '';
        let wynagrodzenieDo = '';

        if (salaryType === 'exact') {
            wynagrodzenie = document.getElementById('editWynagrodzenie').value;
        } else {
            wynagrodzenieOd = document.getElementById('editWynagrodzenieOd').value;
            wynagrodzenieDo = document.getElementById('editWynagrodzenieDo').value;
        }

        const waluta = document.getElementById('editWaluta').value;
        const wynRodzaj = document.getElementById('editWynRodzaj').value;
        const tryb = document.getElementById('editTryb').value;
        const rodzaj = document.getElementById('editRodzaj').value;
        const umowa = document.getElementById('editUmowa').value;
        const kontakt = document.getElementById('editKontakt').value;
        const link = document.getElementById('editLink').value;
        const notatki = document.getElementById('editNotatki').value;
        const favorite = document.getElementById('editFavorite').checked;

        // Validation for salary fields based on type
        if (salaryType === 'exact' && (!wynagrodzenie || wynagrodzenie.trim() === '')) {
            document.getElementById('editFormMessage').textContent = "Pole wynagrodzenie jest wymagane!";
            document.getElementById('editFormMessage').style.color = "red";
            document.getElementById('editWynagrodzenie').focus();
            return;
        } else if (salaryType === 'range' && (!wynagrodzenieOd || !wynagrodzenieDo)) {
            document.getElementById('editFormMessage').textContent = "Wypełnij oba pola widełek (od i do)!";
            document.getElementById('editFormMessage').style.color = "red";
            if (!wynagrodzenieOd) document.getElementById('editWynagrodzenieOd').focus();
            else document.getElementById('editWynagrodzenieDo').focus();
            return;
        }

        let statusHistory = [];
        try {
            statusHistory = JSON.parse(this.dataset.statusHistory || "[]");
        } catch {
            statusHistory = [];
        }
        const prevStatus = this.dataset.prevStatus || "";
        if (status !== prevStatus) {
            const today = new Date().toISOString().slice(0, 10);
            statusHistory.push({ status, date: today });
        }

        // Use the global currentEditImages array instead of reading from DOM
        // This ensures deleted images are properly removed
        const images = currentEditImages ? [...currentEditImages] : [];

        const updateData = {
            stanowisko,
            firma,
            data,
            status,
            waluta,
            wynRodzaj,
            tryb,
            rodzaj,
            umowa,
            kontakt,
            link,
            notatki,
            statusHistory,
            images,
            favorite,
            salaryType
        };

        // Dodaj odpowiednie pola wynagrodzenia w zależności od typu
        if (salaryType === 'exact' && wynagrodzenie) {
            updateData.wynagrodzenie = parseFloat(wynagrodzenie);
            // Usuń stare pola widełek jeśli istnieją
            updateData.wynagrodzenieOd = null;
            updateData.wynagrodzenieDo = null;
        } else if (salaryType === 'range') {
            // Usuń stare pole pojedynczej kwoty
            updateData.wynagrodzenie = null;
            if (wynagrodzenieOd) updateData.wynagrodzenieOd = parseFloat(wynagrodzenieOd);
            if (wynagrodzenieDo) updateData.wynagrodzenieDo = parseFloat(wynagrodzenieDo);
        }

        window.firebaseModules.updateDoc(window.firebaseModules.doc(db, "applications", appId), updateData).then(() => {
            document.getElementById('editFormMessage').textContent = "Zapisano zmiany!";
            const currentSort = document.getElementById('sortOrder')?.value || 'desc';
            loadApplications(getFilters(), document.getElementById('showArchived')?.checked, currentSort);
            setTimeout(() => {
                document.getElementById('editModal').classList.remove('active');
                document.getElementById('editFormMessage').textContent = '';
            }, 1000);
        }).catch(() => {
            document.getElementById('editFormMessage').textContent = "Błąd podczas zapisu.";
            document.getElementById('editFormMessage').style.color = "red";
        });
    });

    if (document.getElementById('archiveAppBtn')) {
        document.getElementById('archiveAppBtn').onclick = async function () {
            const user = window.auth.currentUser;
            if (!user) {
                alert("Musisz być zalogowany!");
                return;
            }

            const appId = document.getElementById('editAppId').value;

            // SECURITY CHECK: Verify user owns this application before archiving
            const docRef = window.firebaseModules.doc(db, "applications", appId);
            const docSnap = await window.firebaseModules.getDoc(docRef);
            if (!docSnap.exists() || docSnap.data().userId !== user.uid) {
                alert("Nie masz uprawnień do archiwizacji tej aplikacji!");
                return;
            }

            window.firebaseModules.updateDoc(docRef, {
                archiwalna: true
            }).then(() => {
                document.getElementById('editModal').classList.remove('active');
                const currentSort = document.getElementById('sortOrder')?.value || 'desc';
                loadApplications(getFilters(), document.getElementById('showArchived')?.checked, currentSort);
            });
        };
    }

    document.getElementById('deleteAppBtn').onclick = async function () {
        const user = window.auth.currentUser;
        if (!user) {
            alert("Musisz być zalogowany!");
            return;
        }

        const appId = document.getElementById('editAppId').value;

        // SECURITY CHECK: Verify user owns this application before deleting
        const docRef = window.firebaseModules.doc(db, "applications", appId);
        const docSnap = await window.firebaseModules.getDoc(docRef);
        if (!docSnap.exists() || docSnap.data().userId !== user.uid) {
            alert("Nie masz uprawnień do usunięcia tej aplikacji!");
            return;
        }

        if (confirm("Czy na pewno chcesz usunąć tę aplikację?")) {
            window.firebaseModules.deleteDoc(docRef).then(() => {
                document.getElementById('editModal').classList.remove('active');
                const currentSort = document.getElementById('sortOrder')?.value || 'desc';
                loadApplications(getFilters(), document.getElementById('showArchived')?.checked, currentSort);
            });
        }
    };

    [
        'filterStanowisko', 'filterFirma', 'filterData', 'filterDateFrom', 'filterDateTo', 'filterDateFieldType'
    ].forEach(id => {
        const el = document.getElementById(id);
        if (el) {
            el.addEventListener('input', function () {
                const sortOrder = document.getElementById('sortOrder')?.value || 'desc';
                loadApplications(getFilters(), document.getElementById('showArchived')?.checked, sortOrder);
            });
        }
    });

    if (document.getElementById('showArchived')) {
        document.getElementById('showArchived').addEventListener('change', function () {
            const sortOrder = document.getElementById('sortOrder')?.value || 'desc';
            loadApplications(getFilters(), this.checked, sortOrder);
        });
    }

    // Sort functionality
    const sortOrderElement = document.getElementById('sortOrder');
    console.log('Checking sortOrder element at startup:', sortOrderElement);
    console.log('sortOrder element exists:', !!sortOrderElement);

    if (sortOrderElement) {
        console.log('Setting up sortOrder event listener');
        sortOrderElement.addEventListener('change', function () {
            console.log('Sort order changed to:', this.value);
            const showArchived = document.getElementById('showArchived')?.checked || false;
            loadApplications(getFilters(), showArchived, this.value);
        });
        sortOrderElement.setAttribute('data-listener-added', 'true');
        console.log('sortOrder event listener attached successfully');
    } else {
        console.log('sortOrder element not found at startup - will use fallback');
    }

    // Fallback event listener registration with retries
    function ensureSortListeners() {
        const sortOrderElement = document.getElementById('sortOrder');
        console.log('ensureSortListeners called - element found:', !!sortOrderElement);

        if (sortOrderElement && !sortOrderElement.hasAttribute('data-listener-added')) {
            console.log('Fallback: Adding sortOrder change listener');
            sortOrderElement.addEventListener('change', function () {
                console.log('Fallback sort order changed to:', this.value);
                const showArchived = document.getElementById('showArchived')?.checked || false;
                loadApplications(getFilters(), showArchived, this.value);
            });
            sortOrderElement.setAttribute('data-listener-added', 'true');
            console.log('Fallback event listener attached successfully');
            return true;
        } else if (sortOrderElement) {
            console.log('sortOrder element already has listener attached');
            return true;
        }
        console.log('sortOrder element still not found');
        return false;
    }

    // Toggle sort button functionality
    const toggleSortButton = document.getElementById('toggleSort');
    const sortContainer = document.getElementById('sortContainer');

    console.log('Toggle sort button:', toggleSortButton);
    console.log('Sort container:', sortContainer);

    if (toggleSortButton && sortContainer) {
        toggleSortButton.addEventListener('click', function () {
            console.log('Toggle sort button clicked');
            const isHidden = sortContainer.style.display === 'none';
            console.log('Sort container was hidden:', isHidden);
            sortContainer.style.display = isHidden ? 'block' : 'none';
            toggleSortButton.innerHTML = isHidden ? '<i class="fas fa-sort"></i> Ukryj sortowanie' : '<i class="fas fa-sort"></i> Sortuj według daty aplikowania';

            // If showing the container, ensure sort listeners are attached
            if (isHidden) {
                console.log('Container was shown, ensuring sort listeners...');
                setTimeout(() => {
                    const result = ensureSortListeners();
                    console.log('ensureSortListeners result:', result);
                }, 50);
            }
        });
    }

    // Clear all filters functionality
    const clearAllButton = document.getElementById('clearAllFilters');
    if (clearAllButton) {
        clearAllButton.addEventListener('click', function () {
            clearAllFilters();
        });
    }

    const sortOrder = document.getElementById('sortOrder')?.value || 'desc';

    // Initialize page state immediately and prevent page flashing
    const landingPage = document.getElementById('landingPage');
    const mainContent = document.getElementById('mainContent');
    const mainMenuLink = document.getElementById('mainMenuLink');

    // Check if we're in the authenticated state by checking localStorage persistence
    const isLikelyAuthenticated = localStorage.getItem('firebase:authUser:AIzaSyBQ3lWo31mLO2gF9cLG6KZzGLX3a3C7dGw:[DEFAULT]') !== null;

    if (isLikelyAuthenticated) {
        // User likely authenticated, show main content immediately
        if (landingPage) landingPage.style.display = 'none';
        if (mainContent) {
            mainContent.style.display = 'block';
            mainContent.style.opacity = '1';
        }
        // Show main menu link for likely authenticated users
        if (mainMenuLink) {
            mainMenuLink.style.display = 'inline';
        }
    } else {
        // User likely not authenticated, show landing page
        if (landingPage) {
            landingPage.style.display = 'block';
            landingPage.style.opacity = '1';
        }
        if (mainContent) mainContent.style.display = 'none';
        // Hide main menu link for unauthenticated users
        if (mainMenuLink) {
            mainMenuLink.style.display = 'none';
        }
    }

    // Firebase auth state change handler
    if (window.firebaseModules && window.firebaseModules.onAuthStateChanged && window.auth) {
        window.firebaseModules.onAuthStateChanged(window.auth, function (user) {
            const landingPage = document.getElementById('landingPage');
            const mainContent = document.getElementById('mainContent');
            const loadingOverlay = document.getElementById('loadingOverlay');
            const googleSigninButtonMain = document.getElementById('google-signin-button-main');
            const mainUserStatus = document.getElementById('main-user-status');
            const mainMenuLink = document.getElementById('mainMenuLink');

            // Add smooth transition class if not already present
            if (landingPage && !landingPage.style.transition) {
                landingPage.style.transition = 'opacity 0.3s ease-in-out';
            }
            if (mainContent && !mainContent.style.transition) {
                mainContent.style.transition = 'opacity 0.3s ease-in-out';
            }

            if (user) {
                // User is logged in - ensure main content is visible immediately
                if (landingPage) {
                    landingPage.style.display = 'none';
                    landingPage.style.opacity = '0';
                }
                if (mainContent) {
                    mainContent.style.display = 'block';
                    mainContent.style.opacity = '1';
                }
                if (loadingOverlay) loadingOverlay.style.display = 'none';

                // Show main menu link for authenticated users
                if (mainMenuLink) {
                    mainMenuLink.style.display = 'inline';
                }

                if (userInfo) {
                    userInfo.textContent = `Witaj, ${user.displayName || user.email}!`;
                    userInfo.style.display = 'inline';
                }
                if (loginBtn) loginBtn.style.display = 'none';
                if (logoutBtn) logoutBtn.style.display = 'inline';

                // Load applications for logged in user
                const sortOrder = document.getElementById('sortOrder')?.value || 'desc';
                loadApplications(getFilters(), document.getElementById('showArchived')?.checked, sortOrder);
            } else {
                // User is logged out - hide main menu link
                if (mainMenuLink) {
                    mainMenuLink.style.display = 'none';
                }

                // User is logged out - show landing page with smooth transition
                if (mainContent && mainContent.style.display === 'block') {
                    mainContent.style.opacity = '0';
                    setTimeout(() => {
                        mainContent.style.display = 'none';
                        if (landingPage) {
                            landingPage.style.display = 'block';
                            landingPage.style.opacity = '0';
                            setTimeout(() => {
                                landingPage.style.opacity = '1';
                            }, 10);
                        }
                    }, 300);
                } else {
                    // Direct switch to landing page if main content wasn't visible
                    if (landingPage) {
                        landingPage.style.display = 'block';
                        landingPage.style.opacity = '1';
                    }
                    if (mainContent) {
                        mainContent.style.display = 'none';
                    }
                }

                const loadingOverlay = document.getElementById('loadingOverlay');
                if (loadingOverlay) loadingOverlay.style.display = 'none';

                const userInfo = document.getElementById('userInfo');
                const loginBtn = document.getElementById('loginBtn');
                const logoutBtn = document.getElementById('logoutBtn');

                if (userInfo) userInfo.style.display = 'none';
                if (loginBtn) loginBtn.style.display = 'inline';
                if (logoutBtn) logoutBtn.style.display = 'none';

                // Reset landing page state - hide login form, show register button
                const loginForm = document.getElementById('loginForm');
                const registerButton = document.getElementById('registerButton');
                if (loginForm) loginForm.style.display = 'none';
                if (registerButton) registerButton.style.display = 'block';

                // Setup Google signin for landing page
                if (googleSigninButtonMain && !googleSigninButtonMain.onclick) {
                    googleSigninButtonMain.onclick = function () {
                        triggerGoogleSignIn(googleSigninButtonMain, mainUserStatus);
                    };
                }

                if (mainUserStatus) {
                    mainUserStatus.textContent = '';
                }
            }
        });
    }

    // Debug function for image upload issues
    window.debugImageUpload = function (message, data = null) {
        const timestamp = new Date().toLocaleTimeString();
        const logMessage = `[IMG-DEBUG ${timestamp}] ${message}`;;

        // Also show in edit modal if available
        const editMessage = document.getElementById('editFormMessage');
        if (editMessage && message.includes('ERROR')) {
            editMessage.textContent = `🐛 ${message}`;
            editMessage.style.color = 'red';
        }
    };

    // Test function for edit modal
    window.testEditModal = function () {
        console.log('=== TESTING EDIT MODAL ===');

        // Check if modal exists
        const editModal = document.getElementById('editModal');
        console.log('Edit modal found:', !!editModal);

        if (editModal) {
            console.log('Modal classes:', editModal.className);
            console.log('Modal display style:', editModal.style.display);
            console.log('Modal computed display:', window.getComputedStyle(editModal).display);

            // Try to open modal manually
            console.log('Attempting to open modal manually...');
            editModal.classList.add('active');
            console.log('Modal classes after adding active:', editModal.className);
            console.log('Modal computed display after adding active:', window.getComputedStyle(editModal).display);

            // Check if form exists
            const form = document.getElementById('editApplicationForm');
            console.log('Form found:', !!form);

            if (form) {
                console.log('Form elements count:', form.elements.length);
                console.log('Form submit button:', !!form.querySelector('button[type="submit"]'));
            }
        }

        console.log('=== END TEST ===');

        return {
            modalExists: !!editModal,
            modalVisible: editModal ? window.getComputedStyle(editModal).display !== 'none' : false,
            formExists: !!document.getElementById('editApplicationForm')
        };
    };

    // Comprehensive debug function
    window.debugAll = function () {
        console.log('=== COMPREHENSIVE DEBUG ===');

        // Check loading overlay
        const loadingOverlay = document.getElementById('loadingOverlay');
        console.log('Loading overlay:', {
            element: !!loadingOverlay,
            display: loadingOverlay?.style.display,
            visible: loadingOverlay ? window.getComputedStyle(loadingOverlay).display : 'not found'
        });

        // Check main sections
        const landingPage = document.getElementById('landingPage');
        const mainContent = document.getElementById('mainContent');
        console.log('Page sections:', {
            landingPage: {
                element: !!landingPage,
                display: landingPage?.style.display,
                visible: landingPage ? window.getComputedStyle(landingPage).display : 'not found'
            },
            mainContent: {
                element: !!mainContent,
                display: mainContent?.style.display,
                visible: mainContent ? window.getComputedStyle(mainContent).display : 'not found'
            }
        });

        // Check Firebase
        console.log('Firebase status:', {
            auth: !!window.auth,
            firebaseModules: !!window.firebaseModules,
            currentUser: window.auth?.currentUser ? 'logged in' : 'not logged in',
            userEmail: window.auth?.currentUser?.email
        });

        // Check edit buttons
        const editButtons = document.querySelectorAll('.edit-btn');
        console.log('Edit buttons:', {
            count: editButtons.length,
            firstButtonId: editButtons[0]?.getAttribute('data-id')
        });

        // Check applications table
        const tbody = document.querySelector('.applications-table tbody');
        console.log('Applications table:', {
            element: !!tbody,
            rowCount: tbody?.children.length || 0
        });

        console.log('=== END COMPREHENSIVE DEBUG ===');

        // Try to force show main content if user is authenticated
        if (window.auth?.currentUser) {
            console.log('User is authenticated - forcing main content display');
            if (loadingOverlay) loadingOverlay.style.display = 'none';
            if (landingPage) landingPage.style.display = 'none';
            if (mainContent) {
                mainContent.style.display = 'block';
                mainContent.style.opacity = '1';
            }
        }
    };

    // Debug function to check Firebase status
    window.debugFirebase = function () {
        console.log('=== DEBUG FIREBASE ===');
        console.log('window.auth:', window.auth);
        console.log('window.firebaseModules:', window.firebaseModules);
        console.log('window.firebaseModules.onAuthStateChanged:', window.firebaseModules?.onAuthStateChanged);
        console.log('Current user:', window.auth?.currentUser);
        console.log('Landing page display:', document.getElementById('landingPage')?.style.display);
        console.log('Main content display:', document.getElementById('mainContent')?.style.display);
        console.log('Loading overlay display:', document.getElementById('loadingOverlay')?.style.display);
        console.log('=== END DEBUG FIREBASE ===');
    };

    // Debug function to check edit buttons
    window.debugEditButtons = function () {
        console.log('=== DEBUG EDIT BUTTONS ===');
        const editButtons = document.querySelectorAll('.edit-btn');
        console.log('Found edit buttons:', editButtons.length);
        editButtons.forEach((btn, index) => {
            console.log(`Button ${index + 1}:`, {
                element: btn,
                dataId: btn.getAttribute('data-id'),
                hasEventListener: btn.onclick !== null,
                innerHTML: btn.innerHTML
            });
        });
        console.log('=== END DEBUG ===');

        // Try to manually trigger openEditModal
        if (editButtons.length > 0) {
            const firstButton = editButtons[0];
            const appId = firstButton.getAttribute('data-id');
            console.log('Testing openEditModal with appId:', appId);
            if (appId) {
                openEditModal(appId);
            }
        }
    };

    // Simple quick check function for immediate debugging
    window.quickCheck = function () {
        console.log('=== QUICK CHECK ===');

        // Check loading overlay
        const loadingOverlay = document.getElementById('loadingOverlay');
        const loadingVisible = loadingOverlay ? window.getComputedStyle(loadingOverlay).display !== 'none' : false;
        console.log('Loading overlay visible:', loadingVisible);

        // Check main sections
        const landingPage = document.getElementById('landingPage');
        const mainContent = document.getElementById('mainContent');
        const landingVisible = landingPage ? window.getComputedStyle(landingPage).display !== 'none' : false;
        const mainVisible = mainContent ? window.getComputedStyle(mainContent).display !== 'none' : false;

        console.log('Landing page visible:', landingVisible);
        console.log('Main content visible:', mainVisible);

        // Check Firebase
        console.log('Firebase auth:', !!window.auth);
        console.log('Current user:', window.auth?.currentUser ? 'logged in' : 'not logged in');

        // Check applications table
        const tbody = document.querySelector('.applications-table tbody');
        const rowCount = tbody?.children.length || 0;
        console.log('Application rows:', rowCount);

        // Check edit buttons
        const editButtons = document.querySelectorAll('.edit-btn');
        console.log('Edit buttons found:', editButtons.length);

        console.log('=== END QUICK CHECK ===');

        // Auto-fix if loading overlay is stuck
        if (loadingVisible) {
            console.log('Loading overlay is stuck - hiding it...');
            if (loadingOverlay) loadingOverlay.style.display = 'none';

            // Show appropriate content
            if (window.auth?.currentUser) {
                console.log('User authenticated - showing main content');
                if (landingPage) landingPage.style.display = 'none';
                if (mainContent) {
                    mainContent.style.display = 'block';
                    mainContent.style.opacity = '1';
                }
            } else {
                console.log('User not authenticated - showing landing page');
                if (landingPage) {
                    landingPage.style.display = 'block';
                    landingPage.style.opacity = '1';
                }
                if (mainContent) mainContent.style.display = 'none';
            }
        }

        return {
            loadingStuck: loadingVisible,
            userLoggedIn: !!window.auth?.currentUser,
            mainContentVisible: mainVisible,
            applicationCount: rowCount,
            editButtonsCount: editButtons.length
        };
    };

    // Function to force hide loading overlay if it's blocking UI
    window.forceHideLoadingOverlay = function () {
        console.log('=== FORCE HIDE LOADING OVERLAY ===');

        const loadingOverlay = document.getElementById('loadingOverlay');
        if (loadingOverlay) {
            console.log('Loading overlay found, hiding it...');
            loadingOverlay.style.display = 'none';
            loadingOverlay.style.visibility = 'hidden';
            loadingOverlay.style.opacity = '0';
            loadingOverlay.style.zIndex = '-1';
            console.log('Loading overlay hidden');
        } else {
            console.log('Loading overlay not found');
        }

        console.log('=== END FORCE HIDE ===');
    };

    // Function to check what's blocking the UI
    window.checkUIBlockers = function () {
        console.log('=== CHECKING UI BLOCKERS ===');

        const elements = [
            'loadingOverlay',
            'landingPage',
            'mainContent',
            'editModal',
            'addAppModal',
            'imageModal'
        ];

        elements.forEach(id => {
            const element = document.getElementById(id);
            if (element) {
                const styles = window.getComputedStyle(element);
                console.log(`${id}:`, {
                    display: styles.display,
                    visibility: styles.visibility,
                    opacity: styles.opacity,
                    zIndex: styles.zIndex,
                    position: styles.position
                });
            } else {
                console.log(`${id}: NOT FOUND`);
            }
        });

        console.log('=== END UI BLOCKERS CHECK ===');
    };

    // Initial load - wait for Firebase to be ready before loading data
    console.log('🚀 Starting initial load...');
    waitForFirebase(() => {
        console.log('🚀 Firebase ready, calling loadApplications...');
        loadApplications(
            getFilters(),
            document.getElementById('showArchived')?.checked,
            'desc'
        );

        const pendingEditId = localStorage.getItem('editAppId');
        if (pendingEditId) {
            console.log('🔍 Found pending edit ID:', pendingEditId);
            openEditModal(pendingEditId);
            localStorage.removeItem('editAppId');
        }
    });

    // Inicjalizacja kolorowych kart filtrów - z opóźnieniem, żeby być pewnym że DOM jest gotowy
    setTimeout(() => {
        ;
        initializeQuickFilters();;

        // Initialize date filters
        initializeDateFilters();
    }, 100);

    // Fallback to hide loading overlay after 10 seconds if Firebase doesn't load
    setTimeout(() => {
        const loadingOverlay = document.getElementById('loadingOverlay');
        if (loadingOverlay && loadingOverlay.style.display !== 'none') {
            console.log('Firebase loading timeout - forcing loading overlay hide');
            loadingOverlay.style.display = 'none';

            // Show landing page if main content is not visible
            const mainContent = document.getElementById('mainContent');
            const landingPage = document.getElementById('landingPage');

            if (mainContent && mainContent.style.display === 'none' && landingPage) {
                landingPage.style.display = 'block';
            }
        }
    }, 10000);

});

// Funkcja do aktualizacji liczników w kartach statusów
function updateStatusCounters(applications = []) {
    // Safely get elements and provide fallbacks
    const totalCountEl = document.getElementById('totalCount');
    const sentCountEl = document.getElementById('sentCount');
    const interviewCountEl = document.getElementById('interviewCount');
    const offerCountEl = document.getElementById('offerCount');
    const rejectedCountEl = document.getElementById('rejectedCount');

    if (!applications || applications.length === 0) {
        // Reset counters to 0
        if (totalCountEl) totalCountEl.textContent = '0';
        if (sentCountEl) sentCountEl.textContent = '0';
        if (interviewCountEl) interviewCountEl.textContent = '0';
        if (offerCountEl) offerCountEl.textContent = '0';
        if (rejectedCountEl) rejectedCountEl.textContent = '0';
        return;
    }

    // Filter out archived applications for counting
    const activeApplications = applications.filter(app => !app.archiwalna);

    // Count total applications
    const totalCount = activeApplications.length;

    // Count by status with exact matching logic (matches filtering logic)
    const sentCount = activeApplications.filter(app =>
        normalizeText(app.status) === 'wyslano cv'
    ).length;

    const interviewCount = activeApplications.filter(app => {


        if (!app.status) return false;
        // Match the exact logic used in filtering
        const interviewStatuses = ['Rozmowa telefoniczna', 'Rozmowa online', 'Rozmowa stacjonarna'];
        return interviewStatuses.includes(app.status);
    }).length;

    const offerCount = activeApplications.filter(app =>
        app.status && app.status.toLowerCase().includes('oferta')

    ).length;

    const rejectedVariants = ['odrzucono', 'odrzucony', 'odrzucona', 'odrzucone'];
    const rejectedCount = activeApplications.filter(app =>
        app.status && rejectedVariants.some(v => app.status.toLowerCase().includes(v))
    ).length;

    // Update counters in HTML with error handling
    if (totalCountEl) totalCountEl.textContent = totalCount.toString();
    if (sentCountEl) sentCountEl.textContent = sentCount.toString();
    if (interviewCountEl) interviewCountEl.textContent = interviewCount.toString();
    if (offerCountEl) offerCountEl.textContent = offerCount.toString();
    if (rejectedCountEl) rejectedCountEl.textContent = rejectedCount.toString();;
}


// Apply status filter and reload applications
function applyStatusFilter(filterValue) {
    if (!window.filters) { window.filters = {}; }
    window.filters.status = filterValue || "";
    const sortOrder = document.getElementById("sortOrder")?.value || "desc";
    const showArchived = document.getElementById("showArchived")?.checked || false;
    loadApplications(getFilters(), showArchived, sortOrder);
}

// Funkcja do inicjalizacji kolorowych kart filtrów statusów
function initializeQuickFilters() {
    ;

    // Initialize global filters object
    if (!window.filters) {
        window.filters = {};
    }

    // Dodaj obsługę kliknięć do kart statusów
    const statusCards = document.querySelectorAll('.filter-card[data-filter-type="status"]');;

    statusCards.forEach((card, index) => {
        const filterValue = card.dataset.filterValue;;

        card.addEventListener('click', function () {
            const filterValue = this.dataset.filterValue;;

            // Check if user is authenticated - if not, show info but still allow filter functionality
            const user = window.auth && window.auth.currentUser;
            if (!user) {
                ;

                // Show brief info message (non-blocking)
                const infoMessage = document.createElement('div');
                infoMessage.style.cssText = `
                    position: fixed; top: 20px; right: 20px; 
                    background: #f59e0b; color: white; padding: 1rem; border-radius: 8px; 
                    z-index: 10000; max-width: 300px; font-size: 14px; box-shadow: 0 4px 12px rgba(0,0,0,0.2);
                `;
                infoMessage.innerHTML = `
                    <i class="fas fa-info-circle" style="margin-right: 0.5rem;"></i>
                    <strong>Filtry działają!</strong><br>
                    Zaloguj się, aby zobaczyć dane.
                `;

                document.body.appendChild(infoMessage);

                // Auto-remove after 3 seconds
                setTimeout(() => {
                    if (infoMessage.parentElement) {
                        infoMessage.remove();
                    }
                }, 3000);

                // Continue with filter functionality even if not authenticated
            }

            // Usuń aktywny stan z innych kart statusów
            document.querySelectorAll('.filter-card[data-filter-type="status"]').forEach(otherCard => {
                otherCard.classList.remove('active');
            });

            // Dodaj aktywny stan do klikniętej karty
            this.classList.add('active');;

            applyStatusFilter(filterValue);

            // Dodaj efekt wizualny
            this.style.transform = 'scale(0.95)';
            setTimeout(() => {
                this.style.transform = '';
            }, 150);
        });
    });;

    // Funkcja do resetowania kart statusów
    window.resetQuickFilters = function () {
        // Clear status filter in global filters object
        if (!window.filters) {
            window.filters = {};
        }
        window.filters.status = "";


        document.querySelectorAll('.filter-card[data-filter-type="status"]').forEach(card => {
            card.classList.remove('active');
        });

        // Aktywuj kartę "Wszystkie aplikacje"
        const allStatusCard = document.querySelector('.filter-card[data-filter-type="status"][data-filter-value=""]');
        if (allStatusCard) {
            allStatusCard.classList.add('active');
        }
    };

    // Funkcja do synchronizacji kart z filtrami z rozwiniętej sekcji
    window.syncQuickFiltersWithAdvanced = function () {
        const filters = getFilters();

        // Resetuj wszystkie karty statusów
        document.querySelectorAll('.filter-card[data-filter-type="status"]').forEach(card => {
            card.classList.remove('active');
        });

        // Synchronizuj karty statusu
        if (filters.status) {
            const statusCard = document.querySelector(`.filter-card[data-filter-type="status"][data-filter-value="${filters.status}"]`);
            if (statusCard) {
                statusCard.classList.add('active');
            }
        } else {
            // Aktywuj kartę "Wszystkie aplikacje"
            const allStatusCard = document.querySelector('.filter-card[data-filter-type="status"][data-filter-value=""]');
            if (allStatusCard) {
                allStatusCard.classList.add('active');
            }
        }
    };

    // Domyślnie aktywuj kartę "Wszystkie aplikacje"
    resetQuickFilters();
}

// Multi-select functionality
window.toggleMultiSelect = function (filterId) {
    const dropdown = document.getElementById(filterId + 'Dropdown');
    const trigger = document.getElementById(filterId + 'Trigger');

    if (!dropdown || !trigger) return;

    // Close other dropdowns first
    document.querySelectorAll('.multi-select-dropdown').forEach(d => {
        if (d.id !== filterId + 'Dropdown') {
            d.style.display = 'none';
            const otherId = d.id.replace('Dropdown', '');
            const otherTrigger = document.getElementById(otherId + 'Trigger');
            if (otherTrigger) {
                otherTrigger.classList.remove('active');
            }
        }
    });

    // Toggle current dropdown
    const isVisible = dropdown.style.display === 'block';
    dropdown.style.display = isVisible ? 'none' : 'block';

    if (isVisible) {
        trigger.classList.remove('active');
    } else {
        trigger.classList.add('active');
    }
};

window.updateMultiSelect = function (filterId) {
    const dropdown = document.getElementById(filterId + 'Dropdown');
    const trigger = document.getElementById(filterId + 'Trigger');
    const textSpan = trigger?.querySelector('.multi-select-text');

    if (!dropdown || !textSpan) return;

    // Get all checked checkboxes
    const checkboxes = dropdown.querySelectorAll('input[type="checkbox"]:checked');
    const selectedValues = Array.from(checkboxes).map(cb => cb.value);
    const selectedLabels = Array.from(checkboxes).map(cb => cb.nextElementSibling?.textContent || cb.value);

    // Update display text
    if (selectedValues.length === 0) {
        // Set default text based on filter type
        if (filterId === 'filterTryb') {
            textSpan.textContent = 'Wszystkie tryby';
        } else if (filterId === 'filterRodzaj') {
            textSpan.textContent = 'Wszystkie rodzaje';
        } else if (filterId === 'filterUmowa') {
            textSpan.textContent = 'Wszystkie umowy';
        }
    } else if (selectedValues.length === 1) {
        textSpan.textContent = selectedLabels[0];
    } else {
        textSpan.textContent = `Wybrano: ${selectedValues.length}`;
    }

    // Add/remove count indicator
    let countIndicator = trigger.querySelector('.multi-select-count');
    if (selectedValues.length > 1) {
        if (!countIndicator) {
            countIndicator = document.createElement('span');
            countIndicator.className = 'multi-select-count';
            trigger.appendChild(countIndicator);
        }
        countIndicator.textContent = selectedValues.length;
    } else {
        if (countIndicator) {
            countIndicator.remove();
        }
    }

    // Trigger filtering
    const sortOrder = document.getElementById('sortOrder')?.value || 'desc';
    loadApplications(getFilters(), document.getElementById('showArchived')?.checked, sortOrder);
};

// Function to get all current filter values including multi-select filters
function getFilters() {
    const filters = {};

    // Text filters
    const stanowisko = document.getElementById('filterStanowisko')?.value;
    const firma = document.getElementById('filterFirma')?.value;
    const status = window.filters?.status || '';

    if (stanowisko) filters.stanowisko = stanowisko;
    if (firma) filters.firma = firma;
    if (status) filters.status = status;

    // Date filters
    const dateType = document.getElementById('filterDateType')?.value;
    const dateFieldType = document.getElementById('filterDateFieldType')?.value || 'application';

    if (dateType === 'exact') {
        const data = document.getElementById('filterData')?.value;
        if (data) {
            filters.data = data;
            filters.dateFieldType = dateFieldType;
        }
    } else if (dateType === 'range') {
        const dateFrom = document.getElementById('filterDateFrom')?.value;
        const dateTo = document.getElementById('filterDateTo')?.value;
        if (dateFrom) {
            filters.dateFrom = dateFrom;
            filters.dateFieldType = dateFieldType;
        }
        if (dateTo) {
            filters.dateTo = dateTo;
            filters.dateFieldType = dateFieldType;
        }
    }

    // Multi-select filters - collect arrays of selected values
    const multiSelectFilters = ['filterTryb', 'filterRodzaj', 'filterUmowa'];

    multiSelectFilters.forEach(filterId => {
        const dropdown = document.getElementById(filterId + 'Dropdown');
        if (dropdown) {
            const checkboxes = dropdown.querySelectorAll('input[type="checkbox"]:checked');
            const selectedValues = Array.from(checkboxes).map(cb => cb.value);

            if (selectedValues.length > 0) {
                // Store as array for multi-select filters
                const fieldName = filterId.replace('filter', '').toLowerCase();
                filters[fieldName] = selectedValues;
            }
        }
    });

    return filters;
}

// Function to clear all filters
function clearAllFilters() {
    // Clear text filters
    if (document.getElementById('filterStanowisko')) {
        document.getElementById('filterStanowisko').value = '';
    }
    if (document.getElementById('filterFirma')) {
        document.getElementById('filterFirma').value = '';
    }

    // Clear date filters
    if (document.getElementById('filterDateType')) {
        document.getElementById('filterDateType').value = '';
    }
    if (document.getElementById('filterData')) {
        document.getElementById('filterData').value = '';
    }
    if (document.getElementById('filterDateFrom')) {
        document.getElementById('filterDateFrom').value = '';
    }
    if (document.getElementById('filterDateTo')) {
        document.getElementById('filterDateTo').value = '';
    }
    if (document.getElementById('filterDateFieldType')) {
        document.getElementById('filterDateFieldType').value = 'application';
    }

    // Hide date filter containers
    const dateFieldTypeContainer = document.getElementById('dateFieldTypeContainer');
    const dateFilterFields = document.getElementById('dateFilterFields');
    const exactDateField = document.getElementById('exactDateField');
    const rangeDateFields = document.getElementById('rangeDateFields');

    if (dateFieldTypeContainer) dateFieldTypeContainer.style.display = 'none';
    if (dateFilterFields) dateFilterFields.style.display = 'none';
    if (exactDateField) exactDateField.style.display = 'none';
    if (rangeDateFields) rangeDateFields.style.display = 'none';

    // Reset date labels
    const exactDateLabel = document.getElementById('exactDateLabel');
    const dateFromLabel = document.getElementById('dateFromLabel');
    const dateToLabel = document.getElementById('dateToLabel');

    if (exactDateLabel) exactDateLabel.textContent = 'Data aplikowania';
    if (dateFromLabel) dateFromLabel.textContent = 'Data od';
    if (dateToLabel) dateToLabel.textContent = 'Data do';

    // Clear multi-select filters
    const multiSelectFilters = ['filterTryb', 'filterRodzaj', 'filterUmowa'];

    multiSelectFilters.forEach(filterId => {
        const dropdown = document.getElementById(filterId + 'Dropdown');
        const trigger = document.getElementById(filterId + 'Trigger');
        const textSpan = trigger?.querySelector('.multi-select-text');

        if (dropdown) {
            // Uncheck all checkboxes
            const checkboxes = dropdown.querySelectorAll('input[type="checkbox"]');
            checkboxes.forEach(cb => cb.checked = false);
        }

        if (textSpan) {
            // Reset display text
            if (filterId === 'filterTryb') {
                textSpan.textContent = 'Wszystkie tryby';
            } else if (filterId === 'filterRodzaj') {
                textSpan.textContent = 'Wszystkie rodzaje';
            } else if (filterId === 'filterUmowa') {
                textSpan.textContent = 'Wszystkie umowy';
            }
        }

        // Remove count indicator
        const countIndicator = trigger?.querySelector('.multi-select-count');
        if (countIndicator) {
            countIndicator.remove();
        }

        // Close dropdown
        if (dropdown) {
            dropdown.style.display = 'none';
        }
        if (trigger) {
            trigger.classList.remove('active');
        }
    });

    // Clear status filter from quick filters
    if (window.resetQuickFilters) {
        window.resetQuickFilters();
    }

    // Clear archived filter
    if (document.getElementById('showArchived')) {
        document.getElementById('showArchived').checked = false;
    }

    // Reload applications with cleared filters
    const sortOrder = document.getElementById('sortOrder')?.value || 'desc';
    loadApplications({}, false, sortOrder);
}

// Function to initialize date filters
function initializeDateFilters() {
    const filterDateType = document.getElementById('filterDateType');
    const filterDateFieldType = document.getElementById('filterDateFieldType');
    const dateFieldTypeContainer = document.getElementById('dateFieldTypeContainer');
    const dateFilterFields = document.getElementById('dateFilterFields');
    const exactDateField = document.getElementById('exactDateField');
    const rangeDateFields = document.getElementById('rangeDateFields');

    // Labels for dynamic updates
    const exactDateLabel = document.getElementById('exactDateLabel');
    const dateFromLabel = document.getElementById('dateFromLabel');
    const dateToLabel = document.getElementById('dateToLabel');

    function updateDateLabels() {
        const fieldType = filterDateFieldType?.value || 'application';
        const isStatusDate = fieldType === 'status';

        if (exactDateLabel) {
            exactDateLabel.textContent = isStatusDate ? 'Data aktualnego statusu' : 'Data aplikowania';
        }
        if (dateFromLabel) {
            dateFromLabel.textContent = isStatusDate ? 'Data statusu od' : 'Data od';
        }
        if (dateToLabel) {
            dateToLabel.textContent = isStatusDate ? 'Data statusu do' : 'Data do';
        }
    }

    // Date type change handler
    if (filterDateType) {
        filterDateType.addEventListener('change', function () {
            const dateType = this.value;

            // Show/hide containers based on selection
            if (dateType === '' || dateType === 'none') {
                // No date filtering
                if (dateFieldTypeContainer) dateFieldTypeContainer.style.display = 'none';
                if (dateFilterFields) dateFilterFields.style.display = 'none';
                if (exactDateField) exactDateField.style.display = 'none';
                if (rangeDateFields) rangeDateFields.style.display = 'none';
            } else {
                // Show date field type selector and fields
                if (dateFieldTypeContainer) dateFieldTypeContainer.style.display = 'block';
                if (dateFilterFields) dateFilterFields.style.display = 'flex';

                if (dateType === 'exact') {
                    // Exact date
                    if (exactDateField) exactDateField.style.display = 'block';
                    if (rangeDateFields) rangeDateFields.style.display = 'none';
                } else if (dateType === 'range') {
                    // Date range
                    if (exactDateField) exactDateField.style.display = 'none';
                    if (rangeDateFields) rangeDateFields.style.display = 'flex';
                }
            }

            // Clear date values when changing type
            if (document.getElementById('filterData')) {
                document.getElementById('filterData').value = '';
            }
            if (document.getElementById('filterDateFrom')) {
                document.getElementById('filterDateFrom').value = '';
            }
            if (document.getElementById('filterDateTo')) {
                document.getElementById('filterDateTo').value = '';
            }

            // Update labels
            updateDateLabels();

            // Trigger filtering
            const sortOrder = document.getElementById('sortOrder')?.value || 'desc';
            loadApplications(getFilters(), document.getElementById('showArchived')?.checked, sortOrder);
        });
    }

    // Date field type change handler
    if (filterDateFieldType) {
        filterDateFieldType.addEventListener('change', function () {
            // Clear date values when changing field type
            if (document.getElementById('filterData')) {
                document.getElementById('filterData').value = '';
            }
            if (document.getElementById('filterDateFrom')) {
                document.getElementById('filterDateFrom').value = '';
            }
            if (document.getElementById('filterDateTo')) {
                document.getElementById('filterDateTo').value = '';
            }

            // Update labels
            updateDateLabels();

            // Trigger filtering
            const sortOrder = document.getElementById('sortOrder')?.value || 'desc';
            loadApplications(getFilters(), document.getElementById('showArchived')?.checked, sortOrder);
        });
    }

    // Initialize labels on page load
    updateDateLabels();
}

// Close dropdowns when clicking outside
document.addEventListener('click', function (event) {
    const isMultiSelectElement = event.target.closest('.multi-select-container');
    if (!isMultiSelectElement) {
        document.querySelectorAll('.multi-select-dropdown').forEach(dropdown => {
            dropdown.style.display = 'none';
            const filterId = dropdown.id.replace('Dropdown', '');
            const trigger = document.getElementById(filterId + 'Trigger');
            if (trigger) {
                trigger.classList.remove('active');
            }
        });
    }
});

