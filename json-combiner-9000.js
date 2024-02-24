const fs = require('fs');
const path = require('path');

const directoryPath = './tablet-files';
const outputFile = './combined.json';

const dictionary = {
  "s": "scouter",
  "e": "event",
  "l": "match level",
  "m": "match",
  "r": "robot",
  "t": "team",
  "as": "auto start pos",
  "al": "left starting zone",
  "aas": "auto amp scores",
  "ass": "auto speaker scores",
  "tas": "amp scores",
  "tss": "speaker scores",
  "tta": "times amplified",
  "tpu": "pickup from",
  "dt": "stage timer",
  "fs": "final status",
  "nit": "note in trap",
  "ds": "driver skill",
  "dr": "defense rating",
  "sr": "speed rating",
  "die": "died",
  "tip": "tippy",
  "dn": "dropped notes",
  "all": "good alliance partner",
  "co": "comments",
}

const fieldTypes = {
  "s": "string",
  "e": "string",
  "l": "string",
  "m": "number",
  "r": "string",
  "t": "string",
  "as": "string",
  "al": "boolean",
  "aas": "number",
  "ass": "number",
  "tas": "number",
  "tss": "number",
  "tta": "number",
  "tpu": "string",
  "dt": "number",
  "fs": "string",
  "nit": "boolean",
  "ds": "string",
  "dr": "string",
  "sr": "number",
  "die": "boolean",
  "tip": "boolean",
  "dn": "boolean",
  "all": "boolean",
  "co": "string",
}


// Function to read all JSON files in a directory
function readJsonFiles(directoryPath) {
  return new Promise((resolve, reject) => {
    fs.readdir(directoryPath, (err, files) => {
      if (err) {
        reject(err);
        return;
      }

      const jsonFiles = files.filter(file => path.extname(file).toLowerCase() === '.json');
      const promises = jsonFiles.map(file => {
        return new Promise((resolve, reject) => {
          fs.readFile(path.join(directoryPath, file), 'utf8', (err, data) => {
            if (err) {
              reject(err);
              return;
            }
            try {
              const jsonData = JSON.parse(data);
              resolve(jsonData);
            } catch (error) {
              reject(error);
            }
          });
        });
      });

      Promise.all(promises)
        .then(data => resolve(data))
        .catch(err => reject(err));
    });
  });
}

// Function to convert fields according to dictionary and fieldTypes
function convertFields(data, dictionary, fieldTypes) {
  const convertedData = data.map(obj => {
    const newObj = {};
    for (let key in obj) {
      const newKey = dictionary[key] || key;
      const fieldType = fieldTypes[key] || 'string';
      if (fieldType === 'number') {
        newObj[newKey] = parseFloat(obj[key]);
      } else if (fieldType === 'boolean') {
        newObj[newKey] = obj[key] === 'true' || obj[key] === true || obj[key] === 1 || obj[key] === '1';
      } else {
        newObj[newKey] = obj[key];
      }
    }
    return newObj;
  });
  return convertedData;
}

// Function to write combined JSON data to a file
function writeCombinedJsonToFile(data, outputFile) {
  return new Promise((resolve, reject) => {
    fs.writeFile(outputFile, JSON.stringify(data, null, 2), 'utf8', err => {
      if (err) {
        reject(err);
        return;
      }
      resolve();
    });
  });
}

// Main function to combine JSON files
async function combineJsonFiles() {
  try {
    const jsonData = await readJsonFiles(directoryPath);
    let combinedData = [].concat(...jsonData); // Combine objects into one array
    combinedData = convertFields(combinedData, dictionary, fieldTypes); // Rename fields and change types
    await writeCombinedJsonToFile(combinedData, outputFile);
    console.log('JSON files combined successfully!');
  } catch (error) {
    console.error('Error combining JSON files:', error);
  }
}

// Call the main function
combineJsonFiles();
