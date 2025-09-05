function getFileParts(filename) {
  if (typeof filename !== 'string') {
    return { basename: filename, extension: '' };
  }

  // List of common photo extensions (case-insensitive matching)
  const photoExtensions = ['.jpg', '.jpeg', '.png', '.heic', '.gif', '.bmp', '.tiff'];
  
  // Convert filename to lowercase for case-insensitive matching
  const lowerFilename = filename.toLowerCase();
  let matchedExtension = '';
  
  // Find the last matching photo extension
  for (const ext of photoExtensions) {
    if (lowerFilename.endsWith(ext)) {
      matchedExtension = filename.slice(filename.length - ext.length); // Preserve original case
      break;
    }
  }

  // If no photo extension is found, return filename as basename with empty extension
  if (!matchedExtension) {
    return { basename: filename, extension: '' };
  }

  // Extract basename (everything before the matched extension)
  const basename = filename.slice(0, filename.length - matchedExtension.length);
  
  return { basename, extension: matchedExtension };
}

export default getFileParts;