# React vs Vue.js : Analyse comparative (version française — lecture uniquement)

Ce document compare les implémentations React et Vue.js des projets du cursus Agentic AI. La version React a été construite en premier, puis migrée vers Vue.js avec l'aide d'un assistant IA. Tous les exemples ci-dessous sont tirés directement des deux implémentations.

## Components (Composants)

### React

En React, un composant est une fonction JavaScript qui retourne du JSX. Les props sont reçues comme un seul argument, généralement déstructuré directement dans la signature de la fonction. En exemple, le composant `Button` du projet React s'écris :

```jsx
function Button({ href, children, variant = "primary", target, rel }) {
  const baseClasses = "px-4 py-2 font-semibold rounded-md transition-colors";
  return (
    <a href={href} target={target} rel={rel} className={`${baseClasses} ...`}>
      {children}
    </a>
  );
}
```

### Vue

En Vue, un composant est un Single File Component (fichier `.vue`) découpé en trois blocs : `<template>` pour le HTML, `<script setup>` pour la logique, et optionnellement `<style>` pour les styles. Le composant `Button.vue` du projet Vue s'écris :

```vue
<script setup>
defineProps({
  href: { type: String, required: true },
  variant: { type: String, default: "primary" },
  target: { type: String, default: null },
  rel: { type: String, default: null },
});
const baseClasses = "px-4 py-2 font-semibold rounded-md transition-colors";
</script>

<template>
  <a :href="href" :target="target" :rel="rel" :class="[baseClasses, ...]">
    <slot />
  </a>
</template>
```

### Similitudes

Les deux approches regroupent le HTML, la logique et le style d'un même bout d'interface dans un seul fichier, acceptent des données typées venant d'un composant parent, et peuvent être combinées pour former des composants plus complexes. React comme Vue encouragent des composants petits et à responsabilité unique (`ui/`, `cards/`, `layout/`, `sections/`).

### Différences

React mélange le HTML et la logique dans la même fonction JavaScript, puisque le JSX n'est que du JavaScript. Vue sépare physiquement le HTML, la logique et le style dans des sections distinctes du fichier. React s'appuie uniquement sur la syntaxe classique des fonctions JavaScript, tandis que Vue introduit son propre format de fichier (`.vue`) qui nécessite une étape de compilation pour être compris par le navigateur.

### Le point d'entrée de l'application

La différence entre les deux frameworks apparaît dès le fichier racine qui démarre l'application. Le `main.jsx` de React :

```jsx
import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import App from "./App.jsx";

createRoot(document.getElementById("root")).render(
  <StrictMode>
    <App />
  </StrictMode>,
);
```

Le `main.js` de Vue :

```js
import { createApp } from 'vue'
import App from './App.vue'

createApp(App).mount('#app')
```

React sépare le cœur du framework (`react`) de son intégration au navigateur (`react-dom`), puisque React peut aussi cibler d'autres environnements comme le mobile. Vue regroupe tout dans un seul package. React récupère d'abord l'élément DOM avec `document.getElementById`, une API JavaScript native avant de créer une racine dessus, alors que Vue accepte directement un sélecteur CSS (`'#app'`) et se charge lui-même de trouver l'élément correspondant.

React enveloppe aussi l'application dans `<StrictMode>`, un composant qui n'existe pas en Vue. `StrictMode` n'affiche rien de particulier et n'a aucun effet en production : il exécute volontairement certaines fonctions deux fois en développement (comme le corps d'un composant) pour aider à repérer des effets de bord accidentels ou du code qui ne serait pas "correct". Vue ne propose pas de mécanisme équivalent, en partie parce que son système de réactivité basé sur des proxies limite naturellement ce type d'erreurs.

## Templates

### JSX

Le JSX est une extension syntaxique de JavaScript qui permet d'écrire du HTML directement dans du code JavaScript. Comme c'est du JavaScript, n'importe quelle expression peut être utilisée en ligne avec des accolades, comme dans le composant `SectionTitle` où la balise elle-même est dynamique :

```jsx
const Tag = as;
return <Tag className={sizeClasses}>{line1}<br /><span>{line2}</span></Tag>;
```

### Les templates Vue

Les templates Vue sont plus proches du HTML classique, mais avec des directives spéciales (`v-if`, `v-for`, `v-bind`, `v-on`) et d'une syntaxe differente (`{{ }}`). La même logique de balise dynamique en Vue utilise l'élément natif `<component>` :

```vue
<component :is="as" :class="sizeClasses">
  {{ line1 }}<br /><span>{{ line2 }}</span>
</component>
```

### Avantages et inconvénients

Le JSX bénéficie de toute la puissance de JavaScript directement dans le template (pas besoin d'apprendre une syntaxe séparée pour les boucles ou les conditions), mais il brouille la frontière entre le HTML et la logique, ce qui peut rendre les templates plus difficiles à lire pour quelqu'un venant du HTML/CSS classique. Les templates Vue sont plus accessibles pour les développeurs venant du HTML/CSS et imposent une séparation plus claire des responsabilités, mais ils demandent d'apprendre des directives propres à Vue et sont plus limités quand une logique très complexe doit apparaître directement dans le HTML.

## Props

### Props React

Les props sont passées comme des attributs JSX et reçues comme un seul objet en argument de la fonction. React n'impose aucune vérification de type sauf si on utilise une bibliothèque comme PropTypes ou TypeScript, la version React de ce projet acceptait donc les props sans validation au runtime, comme dans `FeatureCard.jsx` :

```jsx
function FeatureCard({ icon: Icon, title, description }) {
  return (
    <article>
      <Icon className="w-6 h-6 text-white" />
      <h3>{title}</h3>
      <p>{description}</p>
    </article>
  );
}
```

### Props Vue

Les props Vue sont déclarées de manière clair avec `defineProps()`, avec leur type et leur valeur par défaut, par exemple dans `FeatureCard.vue` :

```js
defineProps({
  icon: { type: [Object, Function], required: true },
  title: { type: String, required: true },
  description: { type: String, required: true },
});
```

### Similitudes et différences

Dans les deux frameworks, les props circulent dans un seul sens, du parent vers l'enfant, et un composant ne doit pas modifier directement ses propres props. La différence principale est que `defineProps()` de Vue fournit une vérification de type au runtime et des valeurs par défaut nativement sans outillage supplémentaire, alors qu'obtenir la même chose en React nécessite TypeScript ou une bibliothèque de validation séparée.

## State management (gestion d'état)

### Gestion d'état React

React utilise le hook `useState`, qui retourne une valeur et une fonction pour la modifier. Les mises à jour d'état sont toujours explicites, via cette fonction, comme dans le `Contact.jsx` original :

```jsx
const [formData, setFormData] = useState({ fullName: "", email: "", message: "" });
setFormData({ ...formData, fullName: e.target.value });
```

### État réactif Vue

Vue utilise `ref()` pour créer une référence réactive. La valeur est lue et modifiée via la propriété `.value` dans le script, mais Vue la déballe automatiquement dans le template. L'équivalent dans `Contact.vue` :

```js
const formData = ref({ fullName: "", email: "", message: "" });
formData.value = { fullName: "", email: "", message: "" };
```

### Similitudes et différences

Les deux mécanismes déclenchent automatiquement un nouveau rendu (React) ou une mise à jour réactive du DOM (Vue) dès que la valeur change. La différence clé est que l'état React est immuable par convention (il faut créer un nouvel objet pour déclencher une mise à jour), alors que le système de réactivité de Vue permet de modifier directement des propriétés imbriquées (`formData.value.fullName = "x"`) et détecte quand même le changement, car Vue enveloppe l'objet dans un proxy réactif.

## Lifecycle (cycle de vie)

### Cycle de vie React

React utilise le hook `useEffect` avec un tableau de dépendances pour exécuter des effets de bord à des moments précis de la vie d'un composant. Un tableau de dépendances vide signifie que l'effet s'exécute une seule fois, après le premier rendu, comme dans le `Insights.jsx` original :

```jsx
useEffect(() => {
  fetchInsights();
}, []);
```

### Cycle de vie Vue

Vue expose des fonctions de cycle de vie dédiées, comme `onMounted()`, qui remplissent un rôle similaire sans avoir besoin de tableau de dépendances. Dans `Insights.vue` :

```js
onMounted(async () => {
  try {
    insights.value = await getInsights();
  } catch (err) {
    error.value = err.message;
  }
});
```

### Similitudes et différences

Les deux mécanismes permettent d'exécuter du code après qu'un composant a été inséré dans le DOM, et les deux peuvent gérer de la logique asynchrone. Le `useEffect` de React est un hook unique et générique qui couvre le montage, la mise à jour et le démontage selon son tableau de dépendances, ce qui peut être source de bugs si ce tableau est incomplet. Vue sépare chaque moment du cycle de vie dans sa propre fonction nommée (`onMounted`, `onUpdated`, `onUnmounted`), ce qui rend l'intention du code plus explicite et supprime le besoin de raisonner sur un tableau de dépendances pour ce type d'effet.

## Conditional rendering (rendu conditionnel)

### Rendu conditionnel React

React s'appuie sur de simples expressions JavaScript dans le JSX, généralement l'opérateur `&&`. Dans `About.jsx`, la ligne reliant les étapes était rendue conditionnellement avec :

```jsx
{index !== steps.length - 1 && <span className="..." />}
```

### Rendu conditionnel Vue

Vue fournit les directives `v-if`, `v-else-if` et `v-else` directement sur les éléments. La même logique dans `About.vue` devient :

```vue
<span v-if="index !== steps.length - 1" class="..." />
```

### Similitudes et différences

Les deux approches expriment la même idée: n'afficher un élément que si une condition est vraie. React réutilise les opérateurs JavaScript standards, ce qui garde une cohérence avec le reste du langage, mais peut sembler moins clair au premier coup d'œil. Les directives de Vue se lisent plus naturellement et séparent clairement la logique de template de la logique JavaScript, au prix d'une syntaxe propre au framework qui n'a de sens que dans un bloc `<template>`.

## Dynamic rendering (rendu dynamique)

### Rendu dynamique React

Les listes sont affichées avec la méthode `.map()`, qui retourne un nouvel élément pour chaque item, avec une prop `key` pour la réconciliation. Dans `Hero.jsx` :

```jsx
{stats.map((stat) => (
  <StatCard key={stat.label} value={stat.value} label={stat.label} />
))}
```

### Rendu dynamique Vue

Vue utilise `v-for`,que l'on utilise sur l'élément à répéter. L'équivalent dans `Hero.vue` :

```vue
<StatCard v-for="stat in stats" :key="stat.label" :value="stat.value" :label="stat.label" />
```

### Similitudes et différences

Les deux frameworks demandent une clé unique pour chaque élément affiché, afin que les mises à jour soient suivies efficacement. L'approche React reste dans la syntaxe JavaScript (`.map()` qui retourne du JSX), alors que le `v-for` de Vue est un attribut déclaratif posé directement sur l'élément du template, ce qui évite d'avoir à écrire un `return` explicite ou une fonction fléchée pour une simple liste.

## Forms (formulaires)

### Gestion de formulaire React

Les champs de formulaire React sont contrôlés via deux éléments séparés : un attribut `value` lié à l'état, et un gestionnaire `onChange` qui met à jour cet état à chaque modification. C'est le schéma utilisé pour chaque champ du `Contact.jsx` original :

```jsx
<input
  id="fullName"
  type="text"
  value={formData.fullName}
  onChange={(e) =>
    setFormData({ ...formData, fullName: e.target.value })
  }
  placeholder="Your full name..."
/>
```

À chaque modification, `onChange` reçoit l'événement, lit la nouvelle valeur dans `e.target.value`, puis reconstruit un nouvel objet `formData` (avec l'opérateur de décomposition `...formData` pour garder les autres champs inchangés) avant de le passer à `setFormData`.

### Gestion de formulaire Vue

Vue combine les deux directions en une seule directive, `v-model`, utilisée dans `Contact.vue` :

```vue
<input id="fullName" type="text" v-model="formData.fullName" ... />
```

### Similitudes et différences

Les deux approches mettent en place des champs contrôlés, où la valeur affichée reflète toujours l'état de l'application plutôt que la valeur brute du champ DOM. La différence se situe dans la façon de l'écrire : React demande d'écrire explicitement la logique de lecture et d'écriture pour chaque champ, alors que `v-model` de Vue est plus simple il génère automatiquement l'équivalent de `:value` et `@input`. La logique de validation (longueur du nom, format de l'email, longueur du message) était implémentée avec de simples expressions JavaScript en React, et avec des propriétés `computed()` en Vue, qui mettent en cache leur résultat jusqu'à ce qu'une dépendance change.

## Events (événements)

### Gestion des événements React

Les gestionnaires d'événements sont passés comme des props en camelCase (`onClick`, `onSubmit`, `onChange`) qui référencent une fonction. Empêcher la soumission par défaut d'un formulaire nécessite d'appeler manuellement `e.preventDefault()` dans le gestionnaire, comme dans `Contact.jsx` :

```jsx
async function handleSubmit(e) {
  e.preventDefault();
  setIsSending(true);
  // ...
}

<form onSubmit={handleSubmit}>
```

### Gestion des événements Vue

Vue lie les événements avec la directive `v-on`, généralement raccourcie en `@`, suivie du nom de l'événement (`@click`, `@submit`). Vue fournit aussi des modificateurs d'événements, utilisés dans `Contact.vue` pour remplacer l'appel manuel à `preventDefault()` :

```vue
<form @submit.prevent="handleSubmit">
```

### Similitudes et différences

Les deux frameworks permettent à un composant de réagir à un événement DOM natif en y attachant une fonction JavaScript. La principale différence observée dans ce projet est le modificateur `.prevent` de Vue, qui supprime le besoin d'appeler `event.preventDefault()` dans le gestionnaire lui-même, rendant l'intention visible directement dans le template plutôt que cachée dans le corps de la fonction.

## Project organization (organisation du projet)

### Structure du projet React

Le projet React était organisé sous `src/` avec `components/ui`, `components/cards`, `components/layout`, `components/sections`, `data/` et `services/`, avec `App.jsx` et `main.jsx` à la racine de `src/`.

### Structure du projet Vue

Le projet Vue reproduit exactement la même arborescence, en remplaçant les fichiers `.jsx` par des fichiers `.vue` et `main.jsx` par `main.js`. C'était un choix délibéré pendant la migration, pour garder la comparaison entre les deux implémentations aussi directe que possible.

### Similitudes et différences

Comme le projet Vue reprend délibérément la structure de dossiers de React, les deux projets sont organisés de façon identique au niveau des répertoires. La seule différence structurelle se situe au niveau du fichier : React regroupe le HTML et la logique dans une seule fonction `.jsx`, alors que Vue les sépare dans des blocs `<template>` et `<script setup>` à l'intérieur de chaque fichier `.vue`.

## AI-assisted migration (migration assistée par IA)

### Outils IA utilisés

Claude a été utilisé tout au long de la migration pour convertir chaque composant de React vers Vue, dossier par dossier (`ui/`, `layout/`, `cards/`, `data/` et `services/`, puis `sections/`), et pour expliquer le raisonnement derrière chaque choix de conversion ainsi que de decrire chaque changement de maniére detailé et clair.

### Ce qui a bien fonctionné

L'assistant IA a correctement traduit les schémas récurrents dans tout le projet : `useState` vers `ref()`, `useEffect` vers `onMounted()`, `.map()` vers `v-for`, le rendu conditionnel vers `v-if`, et les champs contrôlés vers `v-model`. Construire le projet de façon incrémentale, dossier par dossier, et lancer `npm run build` après chaque étape a permis de repérer immédiatement les fichiers manquants et les imports non résolus, plutôt qu'à la toute fin.

### Ce qui a nécessité des corrections manuelles

Deux fichiers (`Button.vue` et `SocialLink.vue`) ont été générés avec la balise d'ouverture `<a` manquante dans le template, ce qui a provoqué une erreur `RolldownError: Invalid end tag` au build. Le bug n'a été trouvé qu'en comparant précisément le contenu du fichier avec le code attendu. Un `id="hero-section"` dupliqué sur la section `Contact`, hérité d'un copier-coller de la section `Hero`, a cassé silencieusement le lien de navigation "Contact" jusqu'à ce que ce soit remarqué et corrigé manuellement. Des éléments comme le style global `scroll-behavior: smooth` dans `global.css`, ou les métadonnées comme le `<title>` de la page et le favicon dans `index.html`, ne faisaient pas partie de la migration des composants et ont dû être reportés manuellement.

### Leçons tirées du processus de migration

La migration assistée par IA est efficace pour traduire des schémas bien connus et répétitifs entre frameworks, mais elle ne supprime pas le besoin de réellement lancer et tester l'application. Les erreurs de build, la navigation cassée et les métadonnées manquantes n'ont été repérées qu'en construisant le projet après chaque étape et en vérifiant manuellement le rendu par rapport à la version React d'origine, ce qui confirme que le code généré par IA a toujours besoin d'être relu et validé, et non accepté aveuglément.