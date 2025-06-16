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

        // Add click to preview larger image
        img.onclick = function () {
            // For Base64 data, create a new window with the image
            if (imageUrl.startsWith('data:')) {
                const newWindow = window.open('', '_blank', 'noopener,noreferrer');
                if (newWindow) {
                    newWindow.document.write(`
                        <!DOCTYPE html>
                        <html>
                        <head>
                            <title>${imageName}</title>
                            <style>
                                body { 
                                    margin: 0; 
                                    padding: 20px; 
                                    background: #000; 
                                    display: flex; 
                                    justify-content: center; 
                                    align-items: center; 
                                    min-height: 100vh;
                                }
                                img { 
                                    max-width: 100%; 
                                    max-height: 100vh; 
                                    object-fit: contain;
                                    box-shadow: 0 4px 20px rgba(255,255,255,0.1);
                                }
                            </style>
                        </head>
                        <body>
                            <img src="${imageUrl}" alt="${imageName}" />
                        </body>
                        </html>
                    `);
                    newWindow.document.close();
                }
            } else {
                // For regular URLs, use the traditional method
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

function loadApplications(filters = {}, showArchived = false, sortOrder = 'desc') {
    console.log('=== LOAD APPLICATIONS CALLED ===');
    console.log('loadApplications called with sortOrder:', sortOrder);
    console.log('loadApplications called with filters:', filters);
    console.log('loadApplications called with showArchived:', showArchived);
    console.log('=================================');

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
        return;
    };

    let q = window.firebaseModules.query(
        window.firebaseModules.collection(db, "applications"),
        window.firebaseModules.where("userId", "==", user.uid)
    );

    window.firebaseModules.getDocs(q).then((querySnapshot) => {
        ;
        const tbody = document.querySelector('.applications-table tbody');
        tbody.innerHTML = '';
        let count = 0;
        let applications = [];

        querySnapshot.forEach((doc) => {
            const app = doc.data();
            app.id = doc.id;
            applications.push(app);
        });;

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
            if (!showArchived && app.archiwalna === true) return;

            let match = true;
            for (const key in filters) {
                if (filters[key]) {
                    // Special handling for "Rozmowy" status filter
                    if (key === 'status' && filters[key] === 'Rozmowy') {
                        const interviewStatuses = ['Rozmowa telefoniczna', 'Rozmowa online', 'Rozmowa stacjonarna'];
                        if (!interviewStatuses.includes(app.status)) {
                            match = false;
                            break;
                        }
                    }
                    // Special handling for "Odrzucono" status filter
                    else if (key === 'status' && filters[key] === 'Odrzucono') {
                        const rejectedVariants = ['odrzucono', 'odrzucony', 'odrzucona', 'odrzucone'];
                        if (!app.status || !rejectedVariants.some(v => app.status.toLowerCase().includes(v))) {
                            match = false;
                            break;
                        }
                    }
                    // Special handling for "Wysłano CV" and "Oferty" status filters
                    else if (key === 'status' && filters[key] === 'Wysłano CV') {
                        if (normalizeText(app.status) !== 'wyslano cv') {
                            match = false;
                            break;
                        }
                    }
                    else if (key === 'status' && filters[key] === 'Oferty') {
                        if (!app.status || !normalizeText(app.status).includes('oferta')) {
                            match = false;
                            break;
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
                    } else if (filters[key] && app[key] != filters[key]) {
                        match = false;
                        break;
                    }
                }
            }
            if (!match) return;

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
    <td class="px-4 py-2 text-gray-600 text-sm font-normal leading-normal min-w-[100px]" data-label="Tryb">${window.sanitizeHTML(app.tryb || '')}</td>
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
            btn.addEventListener('click', function (e) {
                e.preventDefault();
                e.stopPropagation();

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
    });
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

    // Wait for Firebase to be ready
    function waitForFirebase(callback) {
        console.log('Waiting for Firebase...');
        if (window.firebaseModules && window.auth) {
            console.log('Firebase ready!');
            callback();
        } else {
            console.log('Firebase not ready yet, retrying...');
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
    
    // Try to setup immediately
    if (!setupCloseModalHandler()) {
        // If failed, try again after a short delay
        setTimeout(setupCloseModalHandler, 100);
        
        // And try again after a longer delay as final fallback
        setTimeout(setupCloseModalHandler, 500);
    }

    // Enhanced Escape key listener for edit modal
    document.addEventListener('keydown', function(e) {
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
        'filterStanowisko', 'filterFirma', 'filterData', 'filterTryb', 'filterRodzaj', 'filterUmowa'
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
    const isLikelyAuthenticated = localStorage.getItem('firebase:authUser:AIzaSyD7ZLyDHFBNsQe9j03YPi0xmdLbqdk_K68:[DEFAULT]') !== null;

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
                        window.location.href = 'login.html';
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
    waitForFirebase(() => {
        loadApplications(
            getFilters(),
            document.getElementById('showArchived')?.checked,
            'desc'
        );

        const pendingEditId = localStorage.getItem('editAppId');
        if (pendingEditId) {
            openEditModal(pendingEditId);
            localStorage.removeItem('editAppId');
        }
    });

    // Inicjalizacja kolorowych kart filtrów - z opóźnieniem, żeby być pewnym że DOM jest gotowy
    setTimeout(() => {
        ;
        initializeQuickFilters();;
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

// Debug function to check all modal elements
window.checkModalElements = function () {
    console.log('=== CHECKING MODAL ELEMENTS ===');

    const elements = [
        'editModal',
        'editApplicationForm',
        'editAppId',
        'editStanowisko',
        'editFirma',
        'editData',
        'editStatus',
        'editSalaryType',
        'editWynagrodzenie',
        'editWynagrodzenieOd',
        'editWynagrodzenieDo',
        'editWaluta',
        'editWynRodzaj',
        'editTryb',
        'editRodzaj',
        'editUmowa',
        'editKontakt',
        'editLink',
        'editNotatki',
        'editFavorite',
        'editImages',
        'editImagesPreview',
        'statusHistoryBox',
        'statusHistoryList',
        'closeEditModal',
        'editFormMessage'
    ];

    elements.forEach(id => {
        const element = document.getElementById(id);
        console.log(`${id}:`, element ? '✅ EXISTS' : '❌ MISSING');
        if (!element) {
            console.error(`CRITICAL: Missing element with ID: ${id}`);
        }
    });

    console.log('=== END MODAL ELEMENTS CHECK ===');

    return elements.map(id => ({
        id,
        exists: !!document.getElementById(id)
    }));
};

// Function to check if edit buttons exist and have correct event listeners
window.checkEditButtons = function () {
    console.log('=== CHECKING EDIT BUTTONS ===');

    const mainEditButtons = document.querySelectorAll('.edit-btn');
    const favEditButtons = document.querySelectorAll('.edit-btn-fav');

    console.log('Main edit buttons found:', mainEditButtons.length);
    console.log('Favorites edit buttons found:', favEditButtons.length);

    mainEditButtons.forEach((btn, index) => {
        const appId = btn.getAttribute('data-id');
        const hasListener = btn.onclick !== null || btn._addEventListener;
        console.log(`Main button ${index + 1}:`, {
            appId,
            hasListener,
            element: btn
        });
    });

    favEditButtons.forEach((btn, index) => {
        const appId = btn.getAttribute('data-id');
        const hasListener = btn.onclick !== null || btn._addEventListener;
        console.log(`Fav button ${index + 1}:`, {
            appId,
            hasListener,
            element: btn
        });
    });

    console.log('=== END EDIT BUTTONS CHECK ===');

    return {
        mainButtons: mainEditButtons.length,
        favButtons: favEditButtons.length
    };
};

// Function to manually trigger edit button click for testing
window.testEditButtonClick = function () {
    console.log('=== TESTING EDIT BUTTON CLICK ===');

    const editButtons = document.querySelectorAll('.edit-btn');
    console.log('Found edit buttons:', editButtons.length);

    if (editButtons.length === 0) {
        console.log('No edit buttons found. Loading applications first...');

        // Try to load applications first
        const currentSort = document.getElementById('sortOrder')?.value || 'desc';
        loadApplications({}, false, currentSort);

        // Wait a bit then try again
        setTimeout(() => {
            const editButtonsAfterLoad = document.querySelectorAll('.edit-btn');
            console.log('Edit buttons after loading:', editButtonsAfterLoad.length);

            if (editButtonsAfterLoad.length > 0) {
                const firstButton = editButtonsAfterLoad[0];
                console.log('Clicking first edit button:', firstButton);
                firstButton.click();
            } else {
                console.log('Still no edit buttons after loading applications');
            }
        }, 2000);
    } else {
        const firstButton = editButtons[0];
        console.log('Clicking first edit button:', firstButton);
        firstButton.click();
    }

    console.log('=== END TEST EDIT BUTTON CLICK ===');
};

// Function to check if user is logged in and applications are loaded
window.checkApplicationsState = function () {
    console.log('=== CHECKING APPLICATIONS STATE ===');

    const user = window.auth?.currentUser;
    console.log('User logged in:', !!user);
    console.log('User ID:', user?.uid);

    const tbody = document.querySelector('.applications-table tbody');
    const rows = tbody ? tbody.querySelectorAll('tr') : [];
    console.log('Table rows found:', rows.length);

    const editButtons = document.querySelectorAll('.edit-btn');
    console.log('Edit buttons found:', editButtons.length);

    if (rows.length > 0) {
        console.log('Sample row:', rows[0]);
        const firstRowButton = rows[0].querySelector('.edit-btn');
        console.log('First row edit button:', firstRowButton);
        if (firstRowButton) {
            console.log('First button data-id:', firstRowButton.getAttribute('data-id'));
        }
    }

    console.log('=== END APPLICATIONS STATE CHECK ===');

    return {
        userLoggedIn: !!user,
        rowsCount: rows.length,
        editButtonsCount: editButtons.length
    };
};

// Emergency function to diagnose disappeared applications
window.emergencyDiagnosis = function () {
    console.log('=== EMERGENCY DIAGNOSIS ===');

    // Check user authentication
    const user = window.auth?.currentUser;
    console.log('🔐 User authentication:');
    console.log('  Current user:', user);
    console.log('  User ID:', user?.uid);
    console.log('  User email:', user?.email);
    console.log('  Auth ready:', !!window.auth);
    console.log('  Firebase modules:', !!window.firebaseModules);

    // Check Firebase connection
    console.log('🔥 Firebase status:');
    console.log('  Database object:', !!window.db);
    console.log('  Firebase modules available:', Object.keys(window.firebaseModules || {}));

    // Check DOM elements
    console.log('📄 DOM elements:');
    const tbody = document.querySelector('.applications-table tbody');
    console.log('  Table tbody:', !!tbody);
    console.log('  Table rows:', tbody?.children.length || 0);
    console.log('  Loading overlay visible:', document.getElementById('loadingOverlay')?.style.display !== 'none');
    console.log('  Main content visible:', document.getElementById('mainContent')?.style.display !== 'none');
    console.log('  Landing page visible:', document.getElementById('landingPage')?.style.display !== 'none');

    // Try to manually query Firebase
    if (user && window.firebaseModules && window.db) {
        console.log('🔍 Attempting manual Firebase query...');

        const q = window.firebaseModules.query(
            window.firebaseModules.collection(window.db, "applications"),
            window.firebaseModules.where("userId", "==", user.uid),
            window.firebaseModules.limit(5)
        );

        window.firebaseModules.getDocs(q).then((querySnapshot) => {
            console.log('📊 Manual query results:');
            console.log('  Documents found:', querySnapshot.size);

            if (querySnapshot.empty) {
                console.log('  ❌ No documents found for user:', user.uid);
            } else {
                console.log('  ✅ Documents exist:');
                querySnapshot.forEach((doc) => {
                    const data = doc.data();
                    console.log(`    - ${doc.id}: ${data.stanowisko} at ${data.firma}`);
                });
            }
        }).catch((error) => {
            console.error('  ❌ Manual query failed:', error);
        });
    } else {
        console.log('  ❌ Cannot perform manual query - missing prerequisites');
    }

    console.log('=== END EMERGENCY DIAGNOSIS ===');
};

// Function to reload applications with full debug
window.forceReloadApplications = function () {
    console.log('=== FORCE RELOAD APPLICATIONS ===');

    // Clear table first
    const tbody = document.querySelector('.applications-table tbody');
    if (tbody) {
        tbody.innerHTML = '<tr><td colspan="9" style="text-align: center; padding: 2rem; color: #6b7280;">Ładowanie aplikacji...</td></tr>';
    }

    // Get current filters and sort
    const filters = getFilters();
    const showArchived = document.getElementById('showArchived')?.checked || false;
    const sortOrder = document.getElementById('sortOrder')?.value || 'desc';

    console.log('Loading with:', { filters, showArchived, sortOrder });

    // Force reload
    loadApplications(filters, showArchived, sortOrder);

    console.log('=== END FORCE RELOAD ===');
};

// Function to check localStorage and reset if needed
window.checkAndResetStorage = function () {
    console.log('=== CHECKING STORAGE ===');

    // Check Firebase auth persistence
    const authKeys = Object.keys(localStorage).filter(key => key.includes('firebase'));
    console.log('Firebase localStorage keys:', authKeys);

    authKeys.forEach(key => {
        try {
            const value = localStorage.getItem(key);
            console.log(`${key}:`, value ? 'EXISTS' : 'EMPTY');
        } catch (e) {
            console.log(`${key}:`, 'ERROR reading');
        }
    });

    // Check session storage
    const sessionKeys = Object.keys(sessionStorage).filter(key => key.includes('firebase'));
    console.log('Firebase sessionStorage keys:', sessionKeys);

    console.log('=== END STORAGE CHECK ===');
};

// Function to get current filters from form elements
function getFilters() {
    const filters = {};

    // Text filters
    const stanowisko = document.getElementById('filterStanowisko')?.value?.trim();
    const firma = document.getElementById('filterFirma')?.value?.trim();
    const data = document.getElementById('filterData')?.value?.trim();

    // Select filters
    const tryb = document.getElementById('filterTryb')?.value;
    const rodzaj = document.getElementById('filterRodzaj')?.value;
    const umowa = document.getElementById('filterUmowa')?.value;

    if (stanowisko) filters.stanowisko = stanowisko;
    if (firma) filters.firma = firma;
    if (data) filters.data = data;
    if (tryb) filters.tryb = tryb;
    if (rodzaj) filters.rodzaj = rodzaj;
    if (umowa) filters.umowa = umowa;

    // Status filter from global window.filters object (set by quick filter cards)
    if (window.filters && window.filters.status) {
        filters.status = window.filters.status;
    }

    return filters;
}

// Function to clear all filters
function clearAllFilters() {
    console.log('=== CLEAR ALL FILTERS ===');

    // Clear text inputs
    const textFilters = ['filterStanowisko', 'filterFirma', 'filterData'];
    textFilters.forEach(id => {
        const el = document.getElementById(id);
        if (el) el.value = '';
    });

    // Clear select filters
    const selectFilters = ['filterTryb', 'filterRodzaj', 'filterUmowa'];
    selectFilters.forEach(id => {
        const el = document.getElementById(id);
        if (el) el.value = '';
    });

    // Clear global status filter
    if (window.filters) {
        window.filters.status = '';
    }

    // Reset quick filter cards
    if (window.resetQuickFilters) {
        window.resetQuickFilters();
    }

    // Reload applications with no filters
    const sortOrder = document.getElementById('sortOrder')?.value || 'desc';
    const showArchived = document.getElementById('showArchived')?.checked || false;
    loadApplications({}, showArchived, sortOrder);

    console.log('=== FILTERS CLEARED ===');
}

// Prosty test dla użytkownika - do uruchomienia w konsoli przeglądarki
window.testujZamykanieModal = function() {
    console.clear();
    console.log('🧪 === TEST ZAMYKANIA MODALNEGO OKNA ===');
    console.log('');
    
    const editModal = document.getElementById('editModal');
    const closeBtn = document.getElementById('closeEditModal');
    
    console.log('🔍 Sprawdzanie elementów:');
    console.log('  ✓ Modal istnieje:', !!editModal);
    console.log('  ✓ Przycisk X istnieje:', !!closeBtn);
    
    if (!editModal || !closeBtn) {
        console.log('❌ BŁĄD: Nie można znaleźć wszystkich elementów!');
        return;
    }
    
    console.log('');
    console.log('🟢 KROK 1: Otwieranie modalnego okna...');
    
    // Otwórz modal
    editModal.classList.add('active');
    editModal.style.display = 'flex';
    
    // Dodaj treść testową
    const titleElement = editModal.querySelector('h2');
    if (titleElement) {
        titleElement.innerHTML = '🧪 TEST ZAMYKANIA - Spróbuj mnie zamknąć!';
    }
    
    const messageEl = document.getElementById('editFormMessage');
    if (messageEl) {
        messageEl.innerHTML = `
                <div style="background: #e3f2fd; padding: 1rem; border-radius: 8px; margin: 1rem 0; text-align: center;">
                    <h4 style="margin: 0 0 0.5rem 0; color: #1976d2;">🧪 TESTOWANIE ZAMYKANIA MODALNEGO OKNA</h4>
                    <p style="margin: 0.5rem 0; color: #1976d2; font-weight: bold;">
                        Wypróbuj te sposoby zamykania:
                    </p>
                    <ul style="text-align: left; color: #1976d2; margin: 0.5rem 0;">
                        <li>Kliknij przycisk ✕ w prawym górnym rogu</li>
                        <li>Naciśnij klawisz <strong>Escape</strong></li>
                        <li>Kliknij na ciemne tło <strong>poza</strong> oknem</li>
                    </ul>
                    <p style="margin: 0.5rem 0 0 0; color: #666; font-size: 0.9em;">
                        Po zamknięciu sprawdź konsolę - powinna pojawić się wiadomość o zamknięciu.
                    </p>
                </div>
            `;
    }
    
    console.log('✅ Modal został otwarty!');
    console.log('');
    console.log('🎯 INSTRUKCJE:');
    console.log('   1. Sprawdź czy widzisz niebieskie okno z instrukcjami');
    console.log('   2. Wypróbuj zamykanie na 3 sposoby (patrz okno)');
    console.log('   3. Po zamknięciu sprawdź konsolę');
    console.log('');
    console.log('⚠️  Jeśli modal się nie zamyka, oznacza to że mamy problem!');
    
    // Dodaj nasłuchiwacz na zamknięcie
    const originalOnclick = closeBtn.onclick;
    closeBtn.onclick = function(e) {
        console.log('');
        console.log('🔴 PRZYCISK X ZOSTAŁ KLIKNIĘTY!');
        
        if (originalOnclick) {
            originalOnclick.call(this, e);
        }
        
        setTimeout(() => {
            const isStillOpen = editModal.classList.contains('active');
            if (!isStillOpen) {
                console.log('✅ SUKCES: Modal został zamknięty przyciskiem X!');
            } else {
                console.log('❌ PROBLEM: Modal nadal jest otwarty po kliknięciu X!');
            }
        }, 100);
    };
    
    // Nasłuchiwacz na Escape
    const escapeHandler = function(e) {
        if (e.key === 'Escape' && editModal.classList.contains('active')) {
            console.log('');
            console.log('⌨️  KLAWISZ ESCAPE ZOSTAŁ NACIŚNIĘTY!');
            setTimeout(() => {
                const isStillOpen = editModal.classList.contains('active');
                if (!isStillOpen) {
                    console.log('✅ SUKCES: Modal został zamknięty klawiszem Escape!');
                } else {
                    console.log('❌ PROBLEM: Modal nadal jest otwarty po naciśnięciu Escape!');
                }
                document.removeEventListener('keydown', escapeHandler);
            }, 100);
        }
    };
    document.addEventListener('keydown', escapeHandler);
    
    // Nasłuchiwacz na kliknięcie w tło
    const clickHandler = function(e) {
        if (e.target === editModal) {
            console.log('');
            console.log('🖱️  KLIKNIĘTO W TŁO MODALNEGO OKNA!');
            setTimeout(() => {
                const isStillOpen = editModal.classList.contains('active');
                if (!isStillOpen) {
                    console.log('✅ SUKCES: Modal został zamknięty kliknięciem w tło!');
                } else {
                    console.log('❌ PROBLEM: Modal nadal jest otwarty po kliknięciu w tło!');
                }
                editModal.removeEventListener('click', clickHandler);
            }, 100);
        }
    };
    editModal.addEventListener('click', clickHandler);
};

// Funkcja pomocnicza do wymuszonego zamknięcia modalnego okna
window.zamknijModal = function() {
    console.log('🔧 Wymuszam zamknięcie modalnego okna...');
    const editModal = document.getElementById('editModal');
    if (editModal) {
        editModal.classList.remove('active');
        editModal.style.display = 'none';
        console.log('✅ Modal został zamknięty wymuszenie.');
    } else {
        console.log('❌ Nie znaleziono modalnego okna.');
    }
};

