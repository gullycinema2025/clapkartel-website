import React from 'react';

export const toTitleCase = (str) => {
  if (!str) return '';
  return str
    .toLowerCase()
    .split(' ')
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
};

export const formatSubcategoryName = (name) => {
  if (!name) return '';
  const cleanName = name.trim().toLowerCase();

  const mapping = {
    "stylist": "Stylist",
    "exhibitors": "Exhibitors",
    "animal trainers": "Animal\u00A0Trainers",
    "editing studios": "Editing\u00A0Studios",
    "grading studios": "Grading\u00A0Studios",
    "dubbing studios": "Dubbing\u00A0Studios",
    "vfx studios": "VFX\u00A0Studios",
    "vfx studio": "VFX\u00A0Studios",
    "vfx": "VFX",
    "on-set medical": "On-set\u00A0Medical",
    "ai tools": "Ai\u00A0Tools",
    
    "choreography studios": <>Choreography<br/>Studios</>,
    "choreography studio": <>Choreography<br/>Studios</>,
    "animation companies": <>Animation<br/>Companies</>,
    "animation company": <>Animation<br/>Companies</>,
    "sound & mixing studios": <>Sound & Mixing<br/>Studios</>,
    "sound & mixing studio": <>Sound & Mixing<br/>Studios</>,
    "cinematography studios": <>Cinematography<br/>Studios</>,
    "cinematography studio": <>Cinematography<br/>Studios</>,
    "casting call agencies": <>Casting Call<br/>Agencies</>,
    "casting call agency": <>Casting Call<br/>Agencies</>,
    "script writing services": <>Script Writing<br/>Services</>,
    "script writing service": <>Script Writing<br/>Services</>,
    "social media agencies": <>Social Media<br/>Agencies</>,
    "social media agency": <>Social Media<br/>Agencies</>,
    "celebrity fitness trainer": <>Celebrity Fitness<br/>Trainer</>,
    "jr. artist suppliers": <>Jr. Artist<br/>Suppliers</>,
    "jr. artist supplier": <>Jr. Artist<br/>Suppliers</>,
    "makeup & hair stylist studios": <>Makeup & Hair<br/>Stylist Studios</>,
    "makeup & hair stylist studio": <>Makeup & Hair<br/>Stylist Studios</>,
    "makeup & hair stylist inst": <>Makeup & Hair<br/>Stylist Inst</>,
    
    "cinema publicity designers": <>Cinema<br/>Publicity<br/>Designers</>,
    "cinema publicity designer": <>Cinema<br/>Publicity<br/>Designers</>,
    "nutrition for celebrities": <>Nutrition<br/>For<br/>Celebrities</>,
    "nutrition for celebrity": <>Nutrition<br/>For<br/>Celebrities</>
  };

  if (mapping[cleanName] !== undefined) {
    return mapping[cleanName];
  }

  return toTitleCase(name);
};

export const getSubcategoryLineCount = (name) => {
  if (!name) return 1;
  const cleanName = name.trim().toLowerCase();

  // Explicit 1-line names (shortest names)
  const oneLineNames = [
    "jobs", "podcasts", "books", "ebooks", "agreements", "glossary", "ai tools",
    "stylist", "exhibitors", "animal trainers", "editing studios", "editing studio",
    "grading studios", "grading studio", "dubbing studios", "dubbing studio",
    "vfx studios", "vfx studio", "vfx", "on-set medical", "events", "equipment"
  ];

  // Explicit 3-line names (longest names)
  const threeLineNames = [
    "cinema publicity designers", "cinema publicity designer",
    "nutrition for celebrities", "nutrition for celebrity",
    "makeup & hair stylist inst", "makeup & hair stylist studio", "makeup & hair stylist studios",
    "makeup & hair stylist", "celebrity fitness trainer"
  ];

  if (oneLineNames.includes(cleanName)) {
    return 1;
  }

  if (threeLineNames.includes(cleanName)) {
    return 3;
  }

  // 1 line if single word or short length (<= 10 chars)
  if (!cleanName.includes(" ") && !cleanName.includes("&") && !cleanName.includes("-")) {
    return 1;
  }
  if (cleanName.length <= 10) {
    return 1;
  }

  // 3 lines if very long (> 24 chars or 4+ words)
  if (cleanName.length > 24 || cleanName.split(" ").length >= 4) {
    return 3;
  }

  // Default is 2 lines for medium-length names
  return 2;
};

export const compareSubcategories = (a, b, key = 'sub_cat_name') => {
  const nameA = typeof a === 'string' ? a : (a?.[key] || a?.cat_name || a?.sub_category_name || '');
  const nameB = typeof b === 'string' ? b : (b?.[key] || b?.cat_name || b?.sub_category_name || '');

  const countA = getSubcategoryLineCount(nameA);
  const countB = getSubcategoryLineCount(nameB);

  if (countA !== countB) {
    return countA - countB;
  }

  // Secondary sort by text character length (shortest text first)
  return nameA.length - nameB.length;
};
