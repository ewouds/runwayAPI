/**
 * Advanced Fuzzy Search Engine for Airport Database
 * 
 * Features:
 * - Levenshtein distance calculation
 * - Jaro-Winkler similarity scoring  
 * - Soundex phonetic matching
 * - Character transposition detection
 * - Weighted multi-field scoring
 * - City name fuzzy matching with typo tolerance
 */

class FuzzySearch {
    constructor() {
        // Scoring weights for different match types
        this.weights = {
            icao_exact: 100,      // Perfect ICAO match
            icao_prefix: 80,      // ICAO starts with query
            icao_fuzzy: 60,       // Fuzzy ICAO match
            iata_exact: 90,       // Perfect IATA match
            iata_prefix: 70,      // IATA starts with query
            iata_fuzzy: 50,       // Fuzzy IATA match
            name_exact: 70,       // Airport name exact match
            name_partial: 40,     // Airport name contains query
            municipality_exact: 60,  // City exact match
            municipality_partial: 30, // City contains query
            keywords_match: 35    // Keywords match
        };
    }

    /**
     * Calculate Levenshtein distance between two strings
     */
    levenshteinDistance(str1, str2) {
        const matrix = [];
        const len1 = str1.length;
        const len2 = str2.length;

        // Initialize matrix
        for (let i = 0; i <= len2; i++) {
            matrix[i] = [i];
        }
        for (let j = 0; j <= len1; j++) {
            matrix[0][j] = j;
        }

        // Fill matrix
        for (let i = 1; i <= len2; i++) {
            for (let j = 1; j <= len1; j++) {
                if (str2.charAt(i - 1) === str1.charAt(j - 1)) {
                    matrix[i][j] = matrix[i - 1][j - 1];
                } else {
                    matrix[i][j] = Math.min(
                        matrix[i - 1][j - 1] + 1, // substitution
                        matrix[i][j - 1] + 1,     // insertion
                        matrix[i - 1][j] + 1      // deletion
                    );
                }
            }
        }

        return matrix[len2][len1];
    }

    /**
     * Calculate similarity ratio (0-1) based on Levenshtein distance
     */
    similarityRatio(str1, str2) {
        const maxLen = Math.max(str1.length, str2.length);
        if (maxLen === 0) return 1;
        const distance = this.levenshteinDistance(str1.toLowerCase(), str2.toLowerCase());
        return (maxLen - distance) / maxLen;
    }

    /**
     * Calculate Jaro-Winkler similarity for better fuzzy matching
     */
    jaroWinklerSimilarity(str1, str2) {
        str1 = str1.toLowerCase();
        str2 = str2.toLowerCase();

        if (str1 === str2) return 1;

        const len1 = str1.length;
        const len2 = str2.length;
        const matchWindow = Math.floor(Math.max(len1, len2) / 2) - 1;

        if (matchWindow < 0) return 0;

        const str1Matches = new Array(len1).fill(false);
        const str2Matches = new Array(len2).fill(false);

        let matches = 0;
        let transpositions = 0;

        // Find matches
        for (let i = 0; i < len1; i++) {
            const start = Math.max(0, i - matchWindow);
            const end = Math.min(i + matchWindow + 1, len2);

            for (let j = start; j < end; j++) {
                if (str2Matches[j] || str1[i] !== str2[j]) continue;
                str1Matches[i] = str2Matches[j] = true;
                matches++;
                break;
            }
        }

        if (matches === 0) return 0;

        // Find transpositions
        let k = 0;
        for (let i = 0; i < len1; i++) {
            if (!str1Matches[i]) continue;
            while (!str2Matches[k]) k++;
            if (str1[i] !== str2[k]) transpositions++;
            k++;
        }

        const jaro = (matches / len1 + matches / len2 + (matches - transpositions / 2) / matches) / 3;

        // Jaro-Winkler prefix scaling
        let prefix = 0;
        for (let i = 0; i < Math.min(len1, len2, 4); i++) {
            if (str1[i] === str2[i]) prefix++;
            else break;
        }

        return jaro + (0.1 * prefix * (1 - jaro));
    }

    /**
     * Calculate phonetic similarity using simplified Soundex
     */
    soundex(str) {
        if (!str) return '';
        
        str = str.toUpperCase();
        let soundex = str[0];
        
        const mapping = {
            'B': '1', 'F': '1', 'P': '1', 'V': '1',
            'C': '2', 'G': '2', 'J': '2', 'K': '2', 'Q': '2', 'S': '2', 'X': '2', 'Z': '2',
            'D': '3', 'T': '3',
            'L': '4',
            'M': '5', 'N': '5',
            'R': '6'
        };

        for (let i = 1; i < str.length && soundex.length < 4; i++) {
            const code = mapping[str[i]];
            if (code && code !== soundex[soundex.length - 1]) {
                soundex += code;
            }
        }

        return soundex.padEnd(4, '0');
    }

    /**
     * Score an airport against a search query using multiple criteria
     */
    scoreAirport(airport, query) {
        query = query.toLowerCase().trim();
        const queryUpper = query.toUpperCase();
        
        let score = 0;
        const details = {
            matches: [],
            totalScore: 0,
            breakdown: {}
        };

        // ICAO code matching
        if (airport.icao_code) {
            const icao = airport.icao_code.toUpperCase();
            
            if (icao === queryUpper) {
                score += this.weights.icao_exact;
                details.matches.push('ICAO exact match');
                details.breakdown.icao_exact = this.weights.icao_exact;
            } else if (icao.startsWith(queryUpper)) {
                score += this.weights.icao_prefix;
                details.matches.push('ICAO prefix match');
                details.breakdown.icao_prefix = this.weights.icao_prefix;
            } else {
                const similarity = this.jaroWinklerSimilarity(icao, queryUpper);
                if (similarity > 0.7) {
                    const fuzzyScore = this.weights.icao_fuzzy * similarity;
                    score += fuzzyScore;
                    details.matches.push(`ICAO fuzzy match (${(similarity * 100).toFixed(1)}%)`);
                    details.breakdown.icao_fuzzy = fuzzyScore;
                }
            }
        }

        // IATA code matching
        if (airport.iata_code) {
            const iata = airport.iata_code.toUpperCase();
            
            if (iata === queryUpper) {
                score += this.weights.iata_exact;
                details.matches.push('IATA exact match');
                details.breakdown.iata_exact = this.weights.iata_exact;
            } else if (iata.startsWith(queryUpper)) {
                score += this.weights.iata_prefix;
                details.matches.push('IATA prefix match');
                details.breakdown.iata_prefix = this.weights.iata_prefix;
            } else {
                const similarity = this.jaroWinklerSimilarity(iata, queryUpper);
                if (similarity > 0.6) {
                    const fuzzyScore = this.weights.iata_fuzzy * similarity;
                    score += fuzzyScore;
                    details.matches.push(`IATA fuzzy match (${(similarity * 100).toFixed(1)}%)`);
                    details.breakdown.iata_fuzzy = fuzzyScore;
                }
            }
        }

        // Airport name matching
        if (airport.name) {
            const name = airport.name.toLowerCase();
            
            if (name.includes(query)) {
                if (name.startsWith(query)) {
                    score += this.weights.name_exact;
                    details.matches.push('Name starts with query');
                    details.breakdown.name_exact = this.weights.name_exact;
                } else {
                    score += this.weights.name_partial;
                    details.matches.push('Name contains query');
                    details.breakdown.name_partial = this.weights.name_partial;
                }
            } else {
                // Check for word-level matching
                const nameWords = name.split(/\s+/);
                const queryWords = query.split(/\s+/);
                
                for (const nameWord of nameWords) {
                    for (const queryWord of queryWords) {
                        if (queryWord.length >= 3) {
                            const similarity = this.jaroWinklerSimilarity(nameWord, queryWord);
                            if (similarity > 0.8) {
                                score += this.weights.name_partial * similarity * 0.5;
                                details.matches.push(`Name word fuzzy match: "${nameWord}" ~ "${queryWord}"`);
                            }
                        }
                    }
                }
            }
        }

        // Enhanced Municipality/City matching
        if (airport.municipality) {
            const municipality = airport.municipality.toLowerCase();
            
            if (municipality.includes(query)) {
                if (municipality.startsWith(query)) {
                    score += this.weights.municipality_exact;
                    details.matches.push('City starts with query');
                    details.breakdown.municipality_exact = this.weights.municipality_exact;
                } else {
                    score += this.weights.municipality_partial;
                    details.matches.push('City contains query');
                    details.breakdown.municipality_partial = this.weights.municipality_partial;
                }
            } else {
                // Fuzzy city matching - handle compound city names and typos
                const municipalityWords = municipality.split(/[\s,\-()]+/).filter(word => word.length >= 3);
                const queryWords = query.split(/\s+/);
                
                let bestCityMatch = 0;
                let bestCityWord = '';
                let bestQueryWord = '';
                
                for (const queryWord of queryWords) {
                    if (queryWord.length >= 3) {
                        for (const cityWord of municipalityWords) {
                            const similarity = this.jaroWinklerSimilarity(cityWord, queryWord);
                            if (similarity > bestCityMatch && similarity > 0.65) {
                                bestCityMatch = similarity;
                                bestCityWord = cityWord;
                                bestQueryWord = queryWord;
                            }
                        }
                    }
                }
                
                if (bestCityMatch > 0.65) {
                    const fuzzyScore = Math.round(this.weights.municipality_exact * bestCityMatch);
                    score += fuzzyScore;
                    details.matches.push(`City fuzzy match: "${bestCityWord}" ~ "${bestQueryWord}" (${(bestCityMatch * 100).toFixed(1)}%)`);
                    details.breakdown.municipality_fuzzy = fuzzyScore;
                }
                
                // Special handling for partial city matches
                if (query.length >= 4) {
                    for (const cityWord of municipalityWords) {
                        if (cityWord.startsWith(query) || query.startsWith(cityWord)) {
                            score += Math.round(this.weights.municipality_partial * 0.8);
                            details.matches.push(`City partial match: "${cityWord}"`);
                            details.breakdown.municipality_partial_fuzzy = Math.round(this.weights.municipality_partial * 0.8);
                            break;
                        }
                    }
                }
                
                // Phonetic matching for cities
                if (query.length >= 4) {
                    for (const cityWord of municipalityWords) {
                        if (cityWord.length >= 4 && this.soundex(cityWord) === this.soundex(query)) {
                            score += 25;
                            details.matches.push(`City phonetic match: "${cityWord}"`);
                            details.breakdown.city_phonetic = 25;
                            break;
                        }
                    }
                }
            }
        }

        // Keywords matching
        if (airport.keywords) {
            const keywords = airport.keywords.toLowerCase();
            if (keywords.includes(query)) {
                score += this.weights.keywords_match;
                details.matches.push('Keywords match');
                details.breakdown.keywords_match = this.weights.keywords_match;
            }
        }

        // Phonetic matching for codes (helpful for similar sounding codes)
        if (query.length >= 3 && airport.icao_code) {
            const querySoundex = this.soundex(query);
            const icaoSoundex = this.soundex(airport.icao_code);
            
            if (querySoundex === icaoSoundex && querySoundex !== '0000') {
                score += 20; // Bonus for phonetic similarity
                details.matches.push('Phonetic similarity');
                details.breakdown.phonetic = 20;
            }
        }

        // Character transposition tolerance (common typos)
        if (query.length === 4 && airport.icao_code && airport.icao_code.length === 4) {
            const transposed = this.checkTransposition(query.toUpperCase(), airport.icao_code);
            if (transposed) {
                score += 40; // Bonus for likely transposition
                details.matches.push('Likely character transposition');
                details.breakdown.transposition = 40;
            }
        }

        details.totalScore = score;
        return { score, details };
    }

    /**
     * Check if two strings are likely a character transposition (e.g., EGLL vs ELGL)
     */
    checkTransposition(str1, str2) {
        if (str1.length !== str2.length) return false;
        
        let differences = 0;
        const diffPositions = [];
        
        for (let i = 0; i < str1.length; i++) {
            if (str1[i] !== str2[i]) {
                differences++;
                diffPositions.push(i);
            }
        }
        
        // Check for simple adjacent transposition
        if (differences === 2 && diffPositions.length === 2) {
            const [pos1, pos2] = diffPositions;
            if (Math.abs(pos1 - pos2) === 1) {
                return str1[pos1] === str2[pos2] && str1[pos2] === str2[pos1];
            }
        }
        
        return false;
    }

    /**
     * Perform fuzzy search on a list of airports
     */
    fuzzySearch(airports, query, options = {}) {
        const {
            limit = 20,
            minScore = 10,
            includeDetails = false
        } = options;

        if (!query || query.length < 2) {
            return [];
        }

        const scoredResults = airports
            .map(airport => {
                const result = this.scoreAirport(airport, query);
                return {
                    airport,
                    score: result.score,
                    details: includeDetails ? result.details : undefined
                };
            })
            .filter(result => result.score >= minScore)
            .sort((a, b) => b.score - a.score)
            .slice(0, limit);

        return scoredResults;
    }

    /**
     * Get search suggestions based on partial input
     */
    getSuggestions(airports, query, limit = 10) {
        if (!query || query.length < 2) return [];

        const suggestions = new Set();
        const queryUpper = query.toUpperCase();

        // Collect ICAO codes that start with the query
        airports.forEach(airport => {
            if (airport.icao_code && airport.icao_code.startsWith(queryUpper)) {
                suggestions.add(airport.icao_code);
            }
            if (airport.iata_code && airport.iata_code.startsWith(queryUpper) && suggestions.size < limit) {
                suggestions.add(airport.iata_code);
            }
        });

        return Array.from(suggestions).slice(0, limit);
    }
}

module.exports = FuzzySearch;