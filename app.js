/**
 * @file app.js
 * @description Logique applicative pour le redimensionnement et le renommage automatique
 * des candidatures du Concours Photo.
 * @author Antigravity (Google DeepMind AI Assistant) & L'Utilisateur
 */

// Éléments du DOM
const lastNameInput = document.getElementById('last-name');
const dropZone = document.getElementById('drop-zone');
const fileInput = document.getElementById('file-input');
const simDateInput = document.getElementById('sim-date');
const resetDateBtn = document.getElementById('reset-date-btn');
const systemDateDisplay = document.getElementById('current-system-date');

// Éléments d'informations sur le vote
const infoThirdWednesday = document.getElementById('info-third-wednesday');
const infoTargetMonth = document.getElementById('info-target-month');

// Éléments du panneau de résultats
const resultPanel = document.getElementById('result-panel');
const origNameDisplay = document.getElementById('orig-name');
const origDimsDisplay = document.getElementById('orig-dims');
const origSizeDisplay = document.getElementById('orig-size');
const newNameDisplay = document.getElementById('new-name');
const newDimsDisplay = document.getElementById('new-dims');
const newSizeDisplay = document.getElementById('new-size');
const previewOrig = document.getElementById('preview-orig');
const previewResized = document.getElementById('preview-resized');
const downloadBtn = document.getElementById('download-btn');
const toastContainer = document.getElementById('toast-container');

// État de l'application
let currentFile = null;
let resizedBlob = null;
let activeTargetFilename = '';

// Date par défaut définie à celle fournie par le système de l'utilisateur (16 Juin 2026)
const DEFAULT_DATE = new Date('2026-06-16T15:26:53');

/**
 * Affiche une notification toast temporaire
 * @param {string} message Le texte du message
 * @param {'success' | 'error' | 'info'} type Le type de notification
 */
function showToast(message, type = 'info') {
    const toast = document.createElement('div');
    toast.className = `flex items-center gap-3 px-4 py-3 rounded-xl shadow-lg border transition-all duration-300 transform translate-y-2 opacity-0 text-sm font-medium`;
    
    // Style selon le type
    if (type === 'success') {
        toast.className += ' bg-emerald-950/95 border-emerald-500/30 text-emerald-300';
    } else if (type === 'error') {
        toast.className += ' bg-rose-950/95 border-rose-500/30 text-rose-300';
    } else {
        toast.className += ' bg-slate-900/95 border-slate-700/50 text-slate-300';
    }

    // Icône correspondante
    let icon = '';
    if (type === 'success') {
        icon = `<svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M5 13l4 4L19 7"></path></svg>`;
    } else if (type === 'error') {
        icon = `<svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"></path></svg>`;
    } else {
        icon = `<svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>`;
    }

    toast.innerHTML = `
        <span class="flex-shrink-0">${icon}</span>
        <span class="flex-1">${message}</span>
    `;

    toastContainer.appendChild(toast);
    
    // Déclenche l'animation d'entrée
    setTimeout(() => {
        toast.classList.remove('translate-y-2', 'opacity-0');
    }, 10);

    // Animation de sortie et destruction
    setTimeout(() => {
        toast.classList.add('opacity-0', 'translate-y-[-4px]');
        setTimeout(() => {
            toast.remove();
        }, 300);
    }, 3500);
}

/**
 * Calcule les informations de vote en fonction de la date
 * @param {Date} date 
 * @returns {{monthStr: string, thirdWednesday: Date, isNextMonth: boolean}}
 */
function getVoteDetails(date) {
    const year = date.getFullYear();
    const month = date.getMonth(); // 0-11
    
    // Déterminer le 1er du mois et son jour de la semaine
    const firstOfMonth = new Date(year, month, 1);
    const firstDayOfWeek = firstOfMonth.getDay(); // 0 = Dimanche, 1 = Lundi, ..., 3 = Mercredi
    
    // Calculer le premier mercredi du mois
    // Formule : (3 - jour_du_premier_du_mois + 7) % 7 + 1
    const firstWednesday = 1 + (3 - firstDayOfWeek + 7) % 7;
    // Le 3ème mercredi est 14 jours plus tard
    const thirdWednesdayDay = firstWednesday + 14;
    const thirdWednesdayDate = new Date(year, month, thirdWednesdayDay);
    
    // Comparaison du jour du mois avec le 3ème mercredi
    let voteMonth;
    let isNextMonth = false;
    
    if (date.getDate() > thirdWednesdayDay) {
        // Vote le mois prochain
        voteMonth = (month + 1) % 12;
        isNextMonth = true;
    } else {
        // Vote le mois en cours
        voteMonth = month;
    }
    
    const monthNum = voteMonth + 1; // 1-12
    const monthStr = String(monthNum).padStart(2, '0');
    
    return {
        monthStr: monthStr,
        thirdWednesday: thirdWednesdayDate,
        isNextMonth: isNextMonth
    };
}

/**
 * Nettoie le nom de famille pour l'utiliser de manière sécurisée dans le nom du fichier
 * @param {string} name 
 * @returns {string}
 */
function sanitizeLastName(name) {
    if (!name) return 'candidat';
    
    // Remplacement des accents français courants
    let clean = name.trim().toLowerCase();
    
    const accentMap = {
        'à': 'a', 'á': 'a', 'â': 'a', 'ã': 'a', 'ä': 'a', 'å': 'a',
        'ç': 'c',
        'è': 'e', 'é': 'e', 'ê': 'e', 'ë': 'e',
        'ì': 'i', 'í': 'i', 'î': 'i', 'ï': 'i',
        'ð': 'o', 'ò': 'o', 'ó': 'o', 'ô': 'o', 'õ': 'o', 'ö': 'o',
        'ù': 'u', 'ú': 'u', 'û': 'u', 'ü': 'u',
        'ý': 'y', 'ÿ': 'y',
        'ñ': 'n'
    };
    
    for (const [accent, cleanChar] of Object.entries(accentMap)) {
        clean = clean.split(accent).join(cleanChar);
    }
    
    // Remplacement de tout caractère non alphanumérique par un tiret
    clean = clean.replace(/[^a-z0-9]/g, '-');
    
    // Nettoyage des tirets successifs et en bordure
    clean = clean.replace(/-+/g, '-');
    clean = clean.replace(/^-+|-+$/g, '');
    
    return clean || 'candidat';
}

/**
 * Met à jour les informations de vote sur l'interface
 */
function updateVoteInfo() {
    const selectedDateStr = simDateInput.value;
    const simDate = selectedDateStr ? new Date(selectedDateStr) : DEFAULT_DATE;
    
    // Mise à jour de l'affichage de la date système / simulée
    const opt = { day: '2-digit', month: '2-digit', year: 'numeric' };
    systemDateDisplay.textContent = simDate.toLocaleDateString('fr-FR', opt);
    
    // Calculs de vote
    const details = getVoteDetails(simDate);
    
    // Affichage des résultats
    const wedOptions = { day: '2-digit', month: 'long', year: 'numeric' };
    infoThirdWednesday.textContent = details.thirdWednesday.toLocaleDateString('fr-FR', wedOptions);
    
    const monthNames = ['Janvier', 'Février', 'Mars', 'Avril', 'Mai', 'Juin', 'Juillet', 'Août', 'Septembre', 'Octobre', 'Novembre', 'Décembre'];
    const voteMonthIndex = parseInt(details.monthStr, 10) - 1;
    infoTargetMonth.textContent = `${details.monthStr} (${monthNames[voteMonthIndex]})`;
    
    // S'il y a déjà une image chargée, recalculer le nom du fichier
    if (currentFile && resizedBlob) {
        const lastName = lastNameInput.value;
        const sanitized = sanitizeLastName(lastName);
        activeTargetFilename = `${details.monthStr}-${sanitized}.jpg`;
        newNameDisplay.textContent = activeTargetFilename;
    }
}

/**
 * Formate la taille d'un fichier en octets de manière lisible
 * @param {number} bytes 
 * @returns {string}
 */
function formatFileSize(bytes) {
    if (bytes === 0) return '0 octets';
    const k = 1024;
    const sizes = ['Octets', 'Ko', 'Mo'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}

/**
 * Traite le fichier photo déposé : validation, redimensionnement et génération du JPEG final
 * @param {File} file 
 */
function processImage(file) {
    // 1. Validation du Nom de Famille
    const lastName = lastNameInput.value.trim();
    if (!lastName) {
        showToast("Veuillez saisir votre nom de famille avant de déposer votre photo.", "error");
        lastNameInput.focus();
        lastNameInput.classList.add('border-rose-500', 'ring-2', 'ring-rose-500/20');
        setTimeout(() => {
            lastNameInput.classList.remove('border-rose-500', 'ring-2', 'ring-rose-500/20');
        }, 3000);
        return;
    }
    
    // 2. Validation du Type de Fichier
    if (!file.type.startsWith('image/')) {
        showToast("Le fichier déposé n'est pas une image valide.", "error");
        return;
    }
    
    currentFile = file;
    showToast("Fichier reçu. Traitement de l'image en cours...", "info");
    
    // Créer un lecteur de fichier pour l'aperçu original et le chargement dans Image
    const reader = new FileReader();
    
    reader.onload = function(e) {
        const img = new Image();
        
        img.onload = function() {
            // Dimensions d'origine
            const origW = img.naturalWidth;
            const origH = img.naturalHeight;
            
            // Calcul des nouvelles dimensions (le plus grand côté doit faire exactement 1920px)
            const maxDimension = 1920;
            let targetW = origW;
            let targetH = origH;
            
            if (origW > origH) {
                targetW = maxDimension;
                targetH = Math.round((maxDimension * origH) / origW);
            } else {
                targetH = maxDimension;
                targetW = Math.round((maxDimension * origW) / origH);
            }
            
            // Création du Canvas pour le redimensionnement réel des pixels
            const canvas = document.createElement('canvas');
            canvas.width = targetW;
            canvas.height = targetH;
            const ctx = canvas.getContext('2d');
            
            // Amélioration de la qualité du rendu d'image sur le Canvas
            ctx.imageSmoothingEnabled = true;
            ctx.imageSmoothingQuality = 'high';
            
            // Dessiner l'image redimensionnée sur le Canvas
            ctx.drawImage(img, 0, 0, targetW, targetH);
            
            // Conversion du canvas en blob JPG (qualité élevée 90%)
            canvas.toBlob(function(blob) {
                resizedBlob = blob;
                
                // Calculer le nom du fichier de sortie
                const selectedDateStr = simDateInput.value;
                const simDate = selectedDateStr ? new Date(selectedDateStr) : DEFAULT_DATE;
                const details = getVoteDetails(simDate);
                const sanitizedName = sanitizeLastName(lastName);
                activeTargetFilename = `${details.monthStr}-${sanitizedName}.jpg`;
                
                // Mettre à jour l'interface
                origNameDisplay.textContent = file.name;
                origDimsDisplay.textContent = `${origW} × ${origH} px`;
                origSizeDisplay.textContent = formatFileSize(file.size);
                
                newNameDisplay.textContent = activeTargetFilename;
                newDimsDisplay.textContent = `${targetW} × ${targetH} px`;
                newSizeDisplay.textContent = formatFileSize(blob.size);
                
                // Mise en place des aperçus
                previewOrig.src = e.target.result;
                previewResized.src = URL.createObjectURL(blob);
                
                // Révéler le panneau de résultat
                resultPanel.classList.remove('hidden');
                
                // Faire défiler l'utilisateur doucement vers le panneau de résultat
                resultPanel.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
                
                showToast("L'image a été redimensionnée à 1920px de côté maximum avec succès !", "success");
            }, 'image/jpeg', 0.90);
        };
        
        img.onerror = function() {
            showToast("Erreur lors de la lecture de l'image. Le fichier est peut-être corrompu.", "error");
        };
        
        img.src = e.target.result;
    };
    
    reader.readAsDataURL(file);
}

/**
 * Lance le téléchargement du fichier JPG redimensionné et renommé
 */
function downloadResizedImage() {
    if (!resizedBlob || !activeTargetFilename) {
        showToast("Aucune image traitée n'est prête pour le téléchargement.", "error");
        return;
    }
    
    // Créer un lien temporaire pour le téléchargement
    const link = document.createElement('a');
    link.href = URL.createObjectURL(resizedBlob);
    link.download = activeTargetFilename;
    
    // Simuler le clic pour télécharger
    document.body.appendChild(link);
    link.click();
    
    // Nettoyage du DOM
    document.body.removeChild(link);
    
    showToast(`Téléchargement lancé : ${activeTargetFilename}`, "success");
}

// --- ÉCOUTEURS D'ÉVÉNEMENTS ---

// Saisie du nom de famille : Recalcule le nom en direct
lastNameInput.addEventListener('input', () => {
    if (currentFile && resizedBlob) {
        const selectedDateStr = simDateInput.value;
        const simDate = selectedDateStr ? new Date(selectedDateStr) : DEFAULT_DATE;
        const details = getVoteDetails(simDate);
        const sanitized = sanitizeLastName(lastNameInput.value);
        activeTargetFilename = `${details.monthStr}-${sanitized}.jpg`;
        newNameDisplay.textContent = activeTargetFilename;
    }
});

// Événements liés à la zone de Drag & Drop
dropZone.addEventListener('dragover', (e) => {
    e.preventDefault();
    dropZone.classList.add('border-accent-purple', 'bg-accent-purple/10', 'scale-[1.01]');
});

dropZone.addEventListener('dragleave', (e) => {
    e.preventDefault();
    dropZone.classList.remove('border-accent-purple', 'bg-accent-purple/10', 'scale-[1.01]');
});

dropZone.addEventListener('drop', (e) => {
    e.preventDefault();
    dropZone.classList.remove('border-accent-purple', 'bg-accent-purple/10', 'scale-[1.01]');
    
    const files = e.dataTransfer.files;
    if (files.length > 0) {
        processImage(files[0]);
    }
});

// Clic sur la zone de dépôt pour parcourir manuellement
dropZone.addEventListener('click', () => {
    fileInput.click();
});

// Changement sur l'input de fichier natif
fileInput.addEventListener('change', (e) => {
    const files = e.target.files;
    if (files.length > 0) {
        processImage(files[0]);
    }
});

// Clic sur le bouton de téléchargement
downloadBtn.addEventListener('click', downloadResizedImage);

// Modification de la date dans le simulateur
simDateInput.addEventListener('change', () => {
    updateVoteInfo();
    showToast("Date de simulation mise à jour !", "info");
});

// Réinitialisation de la date du simulateur
resetDateBtn.addEventListener('click', () => {
    // Remplir l'input de date au format ISO AAAA-MM-JJ
    const yyyy = DEFAULT_DATE.getFullYear();
    const mm = String(DEFAULT_DATE.getMonth() + 1).padStart(2, '0');
    const dd = String(DEFAULT_DATE.getDate()).padStart(2, '0');
    simDateInput.value = `${yyyy}-${mm}-${dd}`;
    updateVoteInfo();
    showToast("Date réinitialisée à aujourd'hui (16 Juin 2026).", "info");
});

// --- INITIALISATION ---

// Configuration de la date de simulation par défaut dans l'input (AAAA-MM-JJ)
const yyyy = DEFAULT_DATE.getFullYear();
const mm = String(DEFAULT_DATE.getMonth() + 1).padStart(2, '0');
const dd = String(DEFAULT_DATE.getDate()).padStart(2, '0');
simDateInput.value = `${yyyy}-${mm}-${dd}`;

// Exécuter le premier calcul de date de vote
updateVoteInfo();
