const sectionLabels = {
  disease: 'Disease / condition',
  symptoms: 'Symptoms',
  diagnosis: 'Diagnosis',
  treatment: 'Treatment / care plan',
  medications: 'Medications',
  allergies: 'Allergies',
  vitals: 'Vitals / measurements',
  notes: 'Additional notes'
};

export const healthNoteSections = Object.entries(sectionLabels).map(([key, label]) => ({
  key,
  label
}));

export function buildHealthNotes(sections) {
  return healthNoteSections
    .map(({ key, label }) => {
      const value = sections[key]?.trim();
      return value ? `${label}: ${value}` : '';
    })
    .filter(Boolean)
    .join('\n');
}

export function parseHealthNotes(notes = '') {
  const sections = healthNoteSections.reduce((acc, { key }) => {
    acc[key] = '';
    return acc;
  }, {});

  if (!notes) return sections;

  const lines = notes.split('\n');
  const labelToKey = Object.entries(sectionLabels).reduce((acc, [key, label]) => {
    acc[label.toLowerCase()] = key;
    return acc;
  }, {});

  let currentKey = 'notes';

  for (const line of lines) {
    const separatorIndex = line.indexOf(':');
    const possibleLabel = separatorIndex >= 0 ? line.slice(0, separatorIndex).trim().toLowerCase() : '';
    const matchedKey = labelToKey[possibleLabel];

    if (matchedKey) {
      currentKey = matchedKey;
      sections[currentKey] = line.slice(separatorIndex + 1).trim();
    } else if (line.trim()) {
      sections[currentKey] = [sections[currentKey], line.trim()].filter(Boolean).join('\n');
    }
  }

  return sections;
}
