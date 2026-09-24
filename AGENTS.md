# Règles de design — Mansa / afhub

Ces règles s'appliquent à TOUTE modification de l'interface, par n'importe quel outil ou IA travaillant sur ce dépôt.

## Interdictions strictes

1. **Aucun badge décoratif ou informatif superflu.** N'ajoute jamais de badge, pastille ou étiquette (type "Isolation Entreprise", "Ventes Débloquées", "Compensation") sauf si explicitement demandé dans le prompt en cours. En cas de doute, ne l'ajoute pas.

2. **Aucun texte explicatif redondant.** N'ajoute pas de phrase qui répète une information déjà visible ailleurs à l'écran (exemple interdit : expliquer en toutes lettres qu'un solde "reflète strictement les revenus de X sans aucun mélange" quand le titre de la carte le dit déjà). Un chiffre, un titre ou un statut doit pouvoir se comprendre sans paragraphe d'accompagnement.

3. **Pas de bandeaux d'avertissement non demandés.** N'ajoute pas de bandeau coloré (jaune, vert, bleu) avec un message explicatif de plusieurs lignes sauf demande explicite. Un badge court suffit si un statut doit être signalé.

4. **Sobriété par défaut.** Si un élément visuel peut être retiré sans perdre d'information fonctionnelle, ne l'ajoute pas. Préfère toujours l'option la plus minimale entre deux façons d'afficher la même chose.

## Suppression = suppression réelle

Quand on demande de retirer un élément de l'interface :
- Supprime le composant JSX/HTML correspondant, jamais un simple masquage visuel (display:none, opacity:0, condition qui cache sans retirer le rendu).
- Supprime aussi tout état, prop, hook ou appel API qui n'existait que pour alimenter cet élément.
- Si le même texte ou composant existe ailleurs dans le repo (autre écran, composant partagé), recherche TOUTES les occurrences avant de conclure que c'est fait.
- Confirme toujours, après modification, la liste des fichiers touchés et que l'élément n'apparaît plus nulle part dans l'app — pas seulement dans l'écran d'origine de la demande.

## Avant toute modification visuelle

Si une instruction n'est pas explicitement donnée dans le prompt, ne prends pas d'initiative décorative. Demande confirmation plutôt que d'ajouter un élément "par défaut".
