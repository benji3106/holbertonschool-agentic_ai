# Analyse du framework Svelte : React, Vue.js et Svelte

Ce document analyse l'implémentation Svelte de l'application Agentic AI et la compare aux versions React et Vue.js construites précédemment dans ce cursus. Il s'appuie sur la comparaison React vs Vue.js déjà réalisée et se concentre sur ce que Svelte apporte spécifiquement, plutôt que de répéter cette analyse en intégralité.

## Comparaison générale

React, Vue.js et Svelte résolvent tous les mêmes problèmes : découper une interface en composants, garder l'UI synchronisée avec les données et réagir aux interactions de l'utilisateur. Dans les trois implémentations de ce projet, la structure des sections (Header, Hero, About, Features, Insights, Contact, Footer) et l'arborescence de dossiers (`ui/`, `cards/`, `layout/`, `sections/`, `data/`, `services/`) sont restées identiques, ce qui confirme que ce sont des décisions d'architecture indépendantes du framework.

La différence la plus marquante introduite par Svelte est qu'il s'agit d'un compilateur plutôt que d'une bibliothèque exécutée au runtime. React et Vue livrent du code qui s'exécute dans le navigateur et gère la réactivité via un DOM virtuel (React) ou un système basé sur des proxies (Vue). Svelte compile les fichiers `.svelte` en instructions de manipulation directe du DOM (calculées à l'avance) donc il n'y a pas de runtime de framework qui gère la réactivité dans le navigateur. Ce n'est pas visible dans le code écrit, mais cela explique pourquoi les composants Svelte sont souvent plus courts : une grande partie de ce que React et Vue expriment explicitement en JavaScript (wrappers d'état, tableaux de dépendances) est plutôt déduite par le compilateur Svelte à partir de simples déclarations de variables.

Concepts présents dans les trois frameworks : composants, props, état réactif, rendu conditionnel, rendu de listes, hooks de cycle de vie, et champs de formulaire contrôlés. Chacun de ces concepts existe en React, Vue et Svelte, seuls la syntaxe et le mécanisme sous-jacent changent.

## Composants Svelte

Un composant Svelte est un unique fichier `.svelte` qui contient un bloc `<script>` suivi directement du HTML, avec un bloc `<style>` optionnel. Contrairement aux Single File Components de Vue, il n'y a pas de wrapper `<template>` : le HTML est écrit tel quel juste après le script, un peu comme JSX place le HTML à l'intérieur d'une fonction en React, sauf qu'en Svelte le HTML vit entièrement en dehors du script plutôt que d'être retourné par une fonction.

`Button.svelte` illustre bien cela :

```svelte
<script>
  let { href, variant = "primary", target = null, rel = null, children } = $props();

  const baseClasses = "px-4 py-2 font-semibold rounded-md transition-colors";
</script>

<a {href} {target} {rel} class="{baseClasses} {variant === 'primary' ? '...' : '...'}">
  {@render children?.()}
</a>
```

Comparé à la version React, qui enveloppe tout dans une fonction retournant du JSX et à la version Vue, qui sépare `<script setup>` et `<template>` en deux blocs distincts, Svelte se lit le plus comme du HTML classique avec une balise script attachée. Ce qui ma semblé le plus simple, c'est de ne pas avoir à décider où commence le HTML, puisque Svelte a un seul endroit évident pour ça. Ce qui a été le plus surprenant, c'est la prop `children` et la syntaxe `{@render children?.()}`, abordées plus loin, qui ne ressemblent ni au `{children}` de React, ni au `<slot />` de Vue.

## Templates et syntaxe

Par défaut les templates Svelte sont plus proches du HTML classique que le JSX, à l'image de Vue. L'interpolation utilise des accolades simples, `{value}`, la même syntaxe que React utilise dans le JSX, alors que Vue utilise des doubles accolades, `{{ value }}`. C'est une différence discrète mais récurrente, visible dans chaque composant qui affiche une variable, par exemple `StatCard.svelte` :

```svelte
<p class="text-3xl font-black text-violet-300">{value}</p>
```

Le principal avantage de la syntaxe de template Svelte est que les chaînes de classes et les expressions conditionnelles peuvent s'écrire directement avec un ternaire JavaScript classique à l'intérieur de `class="..."`, sans directive dédiée. `InsightCard.svelte` le montre bien :

```svelte
class="... {index === 0 ? 'md:col-span-2' : ''}"
```

C'est proche de la façon dont cette même logique était écrite en React, alors que Vue nécessitait une syntaxe d'objet séparée, `:class="{ 'md:col-span-2': index === 0 }"`. La limite, c'est que les blocs Svelte comme `{#if}` et `{#each}` doivent être explicitement ouverts et fermés, ce qui ajoute plus de markup visible que les directives inline de Vue pour des conditions courtes.

## Props et flux de données

Svelte 5 introduit la rune `$props()` pour déclarer les props reçues par un composant, toujours déstructurées en un seul appel en haut du script :

```svelte
let { icon: Icon, title, description } = $props();
```

C'est plus proche de React que de Vue. React déstructure les props directement dans la signature de la fonction, `function FeatureCard({ icon: Icon, title, description })`, et le `let { icon: Icon, ... } = $props()` de Svelte se lit presque de façon identique, y compris la possibilité de renommer une prop à la déstructuration que React permet aussi nativement. Le `defineProps({...})` de Vue, à l'inverse, demande un objet explicite avec des déclarations de type pour chaque prop. Renommer une prop pour l'utiliser comme composant dynamique, comme fait avec la prop `icon` dans `FeatureCard`, est donc resté quasiment identique entre React et Svelte, alors que Vue avait besoin du mécanisme séparé `<component :is="icon" />` pour arriver au même résultat.

Ce qui est resté conceptuellement similaire dans les trois frameworks, c'est que les props sont en lecture seule, circulent dans un seul sens du parent vers l'enfant, et les valeurs par défaut se déclarent juste à côté du nom de la prop.

## État et réactivité

C'est là que l'approche de Svelte diffère le plus. Le `useState` de React retourne une valeur et une fonction pour la modifier, toute mise à jour passe par cette fonction. Le `ref()` de Vue enveloppe une valeur dans un objet réactif qu'il faut lire et écrire via `.value` dans le script. La rune `$state()` de Svelte 5 à l'inverse, transforme une variable `let` normale en variable réactive, et les mises à jour se font par simple affectation, sans fonction de mise à jour ni déballage `.value` :

```svelte
let insights = $state([]);
// plus loin
insights = data;
```

C'est visiblement moins de code que les versions équivalentes en React et Vue de `Insights`. Le formulaire de contact rend la différence encore plus nette : plutôt qu'un seul objet `formData` mis à jour via une fonction (React) ou via `.value` (Vue), la version Svelte déclare trois variables `$state()` séparées, `fullName`, `email` et `message`, chacune liée directement à son champ avec `bind:value`. Cela supprime le besoin de décomposer un objet précédent pour mettre à jour un seul champ, un schéma que les versions React et Vue nécessitaient toutes les deux.

Ce que ça enseigne sur la réactivité, c'est que le concept, une valeur qui change et se répercute automatiquement sur l'UI est le même partout, mais les frameworks diffèrent dans la part du mécanisme de réactivité qu'ils rendent visible dans le code écrit par le développeur. React la rend entièrement explicite via l'appel à une fonction, Vue la rend partiellement explicite via `.value`, et Svelte la cache presque entièrement derrière une transformation du compilateur appliquée à une simple affectation.

## Logique de rendu

Svelte utilise une syntaxe de blocs explicites aussi bien pour le rendu conditionnel que pour le rendu de listes, ouverts et fermés avec des balises correspondantes : `{#if condition} ... {:else if} ... {:else} ... {/if}` et `{#each items as item, index (key)} ... {/each}`. `About.svelte` et `Hero.svelte` utilisent tous les deux ces blocs :

```svelte
{#each stats as stat (stat.label)}
  <StatCard value={stat.value} label={stat.label} />
{/each}
```

Comparé au `.map()` de React qui retourne du JSX et nécessite une prop `key` sur l'élément retourné, et à la directive `v-for` de Vue posée directement sur l'élément répété avec un `:key` séparé, le `{#each ... (key)}` de Svelte intègre la clé directement dans la syntaxe de la boucle elle-même plutôt que de la traiter comme une prop sur l'enfant. Le rendu conditionnel suit le même schéma de bloc : là où React utilise l'opérateur `&&` ou un ternaire et Vue utilise l'attribut `v-if`, Svelte demande un bloc `{#if}` explicite, ce qui est plus clair pour une condition simple en ligne, mais se lit sans ambiguïté même pour des conditions imbriquées, comme la logique de la ligne connectrice dans `About.svelte`.

## Cycle de vie et effets de bord

Svelte 5 n'utilise plus une fonction de cycle de vie dédiée `onMount` comme outil principal pour les effets de bord dans ce genre de scénario, à la place la rune `$effect()` a été utilisée dans `Insights.svelte` pour charger les données après le rendu du composant :

```svelte
$effect(() => {
  getInsights()
    .then((data) => { insights = data; })
    .catch((err) => { error = err.message; });
});
```

Conceptuellement, ça joue le même rôle que le `useEffect(() => {...}, [])` de React et le `onMounted(() => {...})` de Vue : du code qui s'exécute une fois le composant inséré dans le DOM. Ce qui diffère, c'est le modèle sous-jacent. Le `useEffect` de React dépend d'un tableau de dépendances explicite pour décider quand se ré-exécuter. Le `onMounted` de Vue est lié à un moment précis du cycle de vie et ne se ré-exécute jamais. Le `$effect()` de Svelte suit automatiquement toute valeur réactive lue à l'intérieur et se ré-exécute dès que l'une d'elles change sans tableau de dépendances à maintenir, il ne s'est exécuté qu'une seule fois dans `Insights.svelte` parce qu'aucune variable réactive n'était lue dans le corps de l'effet. Une contrainte pratique rencontrée est que la fonction passée à `$effect()` ne peut pas être directement `async`, contrairement à `useEffect` et `onMounted` qui acceptent tous les deux un callback async, il a donc fallu utiliser `.then()/.catch()` plutôt que `async/await` à l'intérieur de l'effet.

## Formulaires et événements

Le binding de formulaire suit le même schéma à trois approches déjà vu dans la comparaison des frameworks, mais la version Svelte est la plus concise. React a besoin d'un attribut `value` couplé à un gestionnaire `onChange`, Vue a besoin d'une seule directive `v-model`, Svelte a besoin d'une seule directive `bind:value`, fonctionnellement équivalente au `v-model` de Vue mais nommée différemment :

```svelte
<input bind:value={fullName} ... />
```

La gestion des événements en Svelte 5 utilise des attributs en minuscules sans préfixe comme `onsubmit`, `onclick`, correspondant directement aux noms d'événements DOM natifs, contrairement au `onSubmit` en camelCase de React ou au raccourci `@submit` de Vue. Svelte n'a pas non plus d'équivalent au modificateur `.prevent` de Vue, donc `handleSubmit` appelle `e.preventDefault()` manuellement, exactement comme la version React. Cela signifie que, sur ce point précis, la gestion d'événements de Svelte est plus proche de React que de Vue.

## Organisation du projet

Le projet Svelte reprend exactement la même arborescence de dossiers que les projets React et Vue, `components/ui`, `components/cards`, `components/layout`, `components/sections`, `data/`, `services/`, avec les fichiers `.jsx` et `.vue` remplacés par des fichiers `.svelte`, et `main.jsx`/`main.js` remplacé par un `main.js` qui appelle la fonction `mount()` de Svelte. Rien dans Svelte n'a forcé une organisation différente, le principe d'un dossier par responsabilité utilisé tout au long de ce cursus est indépendant du framework. La seule convention propre à Svelte qui a émergé concerne la configuration ESLint : contrairement à React et Vue.js, l'assistant `@eslint/create-config` ne propose pas Svelte comme option de framework, donc `eslint-plugin-svelte` a dû être installé et intégré manuellement dans `eslint.config.js` plutôt que via l'assistant interactif.

## Migration assistée par IA

Claude a été utilisé tout au long de la migration Svelte, en suivant le même processus incrémental, dossier par dossier, établi pendant la migration Vue.js : `ui/` d'abord, puis `layout/`, `cards/`, `data/` et `services/`, puis `sections/`, avec un `npm run build` après chaque étape pour repérer immédiatement les fichiers manquants.

Avoir les versions React et Vue.js déjà terminées a rendu la migration Svelte nettement plus rapide à vérifier, puisque chaque nouveau schéma Svelte pouvait être comparé à deux implémentations de référence connues plutôt qu'à une seule. Cela a aussi facilité l'identification des parties du code qui relevaient de la traduction propre au framework (état, cycle de vie, syntaxe de template) et des parties qui étaient de la logique métier inchangée, comme les règles de validation du formulaire de contact ou le délai asynchrone dans `handleSubmit`, restées identiques dans les trois versions.

Ce qui a bien fonctionné, c'est la traduction des schémas bien établis : props, rendu de listes, rendu conditionnel et champs contrôlés se sont tous convertis proprement vers leurs équivalents Svelte. Ce qui a nécessité une relecture manuelle, c'est de nouveau une balise d'ouverture `<a` cassée dans `Button.svelte` et `SocialLink.svelte`, la même catégorie d'erreur de copier-coller rencontrée pendant la migration Vue.js, ce qui confirme que c'est un risque récurrent indépendant du framework plutôt qu'un problème spécifique à Vue ou à Svelte. La structure globalement propre et cohérente du projet React d'origine, avec des composants petits et à responsabilité unique et des fichiers de données et de services clairement séparés, a rendu chacune de ces corrections facile à isoler, puisqu'une erreur de build ou une icône manquante pointait directement vers un petit fichier plutôt que vers un gros fichier aux responsabilités mélangées.

## Perspective professionnelle

Migrer la même application vers un troisième framework a rendu plus évident que la compétence transférable, c'est comprendre l'architecture des composants, le flux de données et la réactivité en tant que concepts, pas mémoriser la syntaxe d'un framework en particulier. Une fois qu'un développeur peut répondre à la question « où vit l'état de ce composant, et qu'est-ce qui déclenche un nouveau rendu », traduire cette réponse en `useState`, `ref()`, ou `$state()` devient une étape mécanique plutôt que conceptuelle.

L'assistance IA a réduit la barrière entre les frameworks principalement en gérant cette traduction mécanique rapidement, et en expliquant sur demande, pourquoi telle construction Svelte existe et ce qu'elle remplace par rapport aux frameworks étudiés précédemment. Elle n'a pas supprimé le besoin de relire attentivement le code généré : des erreurs de build, un `id="hero-section"` dupliqué dans un projet précédent, et des balises d'ouverture mal formées n'ont été repérés qu'en construisant et en testant réellement l'application après chaque étape, pas en faisant confiance au code généré sur simple lecture. Ce projet a confirmé que la migration assistée par IA est un outil de productivité pour traduire des schémas connus, pas un substitut à la compréhension de ce que fait le code ni à la validation qu'il se comporte correctement une fois écrit.