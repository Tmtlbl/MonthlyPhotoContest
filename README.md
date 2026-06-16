# Concours Photo - Optimisation & Renommage Automatique

> 🤖 **Application développée en pair programming avec l'IA Antigravity (Google DeepMind)**

Cette application web monopage (HTML / Tailwind CSS / JavaScript) permet aux candidats d'un concours photo de soumettre leur image en la préparant automatiquement aux spécifications techniques requises pour les sessions de vote mensuelles.

---

## 🚀 Fonctionnalités

1. **Saisie & Validation** : Le candidat saisit son nom de famille (obligatoire).
2. **Zone de Dépôt Interactive** : Supporte le glisser-déposer (Drag & Drop) d'images et le parcours classique des fichiers avec retour d'état visuel et animations fluides.
3. **Redimensionnement Réel** :
   - Traitement des pixels effectué via un canevas HTML5 (`<canvas>`).
   - Le plus grand côté de l'image est redimensionné à exactement **1920px**.
   - Le second côté est recalculé pour conserver le ratio d'aspect exact.
   - L'image finale est encodée et exportée au format **JPEG** binaire.
4. **Calcul du Mois de Vote (Règle du 3ème Mercredi)** :
   - Recherche du 3ème mercredi du mois courant.
   - Si la date de soumission est **inférieure ou égale** à ce 3ème mercredi, le vote a lieu le **mois en cours**.
   - Si la date est **strictement supérieure** au 3ème mercredi, le vote est reporté au **mois suivant**.
5. **Renommage Automatique** :
   - Format final : `[numéro du mois]-[nom-de-famille].jpg`.
   - Le nom de famille est normalisé (minuscules, suppression des accents et caractères spéciaux, espaces remplacés par des tirets `-`).
6. **Simulateur Temporel** : Un volet permet de tester l'algorithme avec différentes dates de simulation pour voir le numéro de mois s'ajuster dynamiquement.

---

## 📁 Structure du Projet

```text
Concours photo/
├── index.html   # Structure HTML5 & Style Tailwind CSS
├── app.js       # Logique JS (Calculs de dates, Canvas, drag & drop)
└── README.md    # Documentation du projet & Historique
```

---

## 🛠️ Démarrage Local

Pour tester l'application sur votre poste :
1. Lancez un serveur HTTP local dans le dossier racine. Par exemple avec Python :
   ```bash
   python -m http.server 8000
   ```
2. Ouvrez l'adresse suivante dans votre navigateur internet :
   [http://localhost:8000](http://localhost:8000)

---

## 📈 Historique des Modifications (Changelog)

### v1.0.0 (16 Juin 2026) - *Version Initiale*
- **Interface Utilisateur** :
  - Création du design sombre premium à base de cartes en verre dépoli (glassmorphism) et dégradés néon.
  - Intégration de Tailwind CSS v3 via CDN et police Outfit (Google Fonts).
  - Ajout d'animations interactives sur la zone de drag & drop et les boutons.
- **Logique Métier** :
  - Implémentation du script principal [app.js](file:///f:/Documents/Concours%20photo/app.js) avec gestion d'état réactive.
  - Ajout de l'algorithme de recherche du 3ème mercredi de chaque mois pour le calcul de la période de vote.
  - Implémentation de la fonction de nettoyage des caractères de noms de famille (`sanitizeLastName`).
  - Développement de la logique de traitement d'images via Canvas (redimensionnement physique réel à 1920px sur la plus grande dimension).
  - Intégration du module d'exportation binaire JPEG et du téléchargement forcé.
- **Outillage** :
  - Ajout d'un panneau didactique affichant la date limite de vote calculée.
  - Ajout d'un simulateur de date pour permettre le test de l'application à différentes périodes de l'année.

---

## 🤖 Mentions de co-création IA

Cette application a été conçue, programmée et testée en collaboration étroite avec l'assistant IA **Antigravity** (développé par l'équipe **Advanced Agentic Coding** de **Google DeepMind**). 

### Rôles de l'IA :
- **Architecture de l'Interface (UI/UX)** : Élaboration de la structure responsive, implémentation des styles Tailwind CSS avec des effets visuels premiums (verre dépoli, dégradés d'arrière-plan, transitions réactives sur la zone de glisser-déposer).
- **Implémentation algorithmique** : Conception des scripts de redimensionnement de pixels réels sur canevas HTML5 et de l'algorithme de calendrier calculant le troisième mercredi de chaque mois.
- **Validation** : Réalisation de tests de bout en bout pilotés par agent de navigation virtuel (Playwright) pour s'assurer de la viabilité des formules temporelles et comportementales.
