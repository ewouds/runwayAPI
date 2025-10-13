/**
 * Comprehensive Test Suite for RunwayAPI
 * Tests all endpoints including fuzzy search, city search, and runway data
 */

const axios = require('axios');

// Configuration
const BASE_URL = 'http://localhost:3002';
const API_BASE = `${BASE_URL}/api/v1`;

class APITester {
    constructor() {
        this.passed = 0;
        this.failed = 0;
        this.total = 0;
    }

    async testEndpoint(name, url, expectedItems = null) {
        this.total++;
        
        try {
            console.log(`\n🧪 ${this.total}. Testing: ${name}`);
            console.log(`📡 URL: ${url.replace(BASE_URL, '')}`);
            
            const response = await axios.get(url, { timeout: 10000 });
            
            if (response.status === 200 && response.data.code === 0) {
                this.passed++;
                console.log(`✅ PASSED`);
                
                // Display results summary
                if (response.data.data) {
                    const data = response.data.data;
                    
                    if (data.airports) {
                        console.log(`   📊 Found: ${data.count || data.airports.length} results`);
                        
                        // Show sample results
                        const samples = data.airports.slice(0, 2);
                        samples.forEach((airport, index) => {
                            const icao = airport.icao_code || 'N/A';
                            const city = airport.municipality || airport.city || 'N/A';
                            const name = airport.name || 'N/A';
                            const score = airport.fuzzyScore ? ` (${Math.round(airport.fuzzyScore)}%)` : '';
                            console.log(`   ${index + 1}. ${icao} - ${city} - ${name}${score}`);
                        });
                    } else if (data.countries) {
                        console.log(`   📊 Found: ${data.countries.length} countries`);
                        data.countries.slice(0, 3).forEach((country, index) => {
                            console.log(`   ${index + 1}. ${country.country_name}: ${country.total_airports} airports`);
                        });
                    } else if (data.name) {
                        // Single airport result
                        console.log(`   📍 Airport: ${data.name} (${data.icao_code}/${data.iata_code})`);
                        console.log(`   📍 Location: ${data.municipality}, ${data.country_name}`);
                    } else if (data.runway) {
                        // Runway data
                        console.log(`   🛫 Runway: ${data.runway.runway_ident || 'N/A'}`);
                        console.log(`   📏 Length: ${data.runway.length_ft || 'N/A'} ft`);
                    }
                }
            } else {
                this.failed++;
                console.log(`❌ FAILED - Status: ${response.status}, Code: ${response.data.code}`);
                console.log(`   Message: ${response.data.message || 'Unknown error'}`);
            }
        } catch (error) {
            this.failed++;
            console.log(`❌ FAILED - ${error.message}`);
            if (error.code === 'ECONNREFUSED') {
                console.log(`   💡 Server not running on ${BASE_URL}`);
            }
        }
        
        // Small delay between tests
        await new Promise(resolve => setTimeout(resolve, 200));
    }

    async runAllTests() {
        console.log('🚀 RunwayAPI Comprehensive Test Suite');
        console.log('=====================================\n');
        
        // Check server availability
        try {
            await axios.get(BASE_URL, { timeout: 5000 });
            console.log('✅ Server is running\n');
        } catch (error) {
            console.log('❌ Server is not running - please start the server first');
            console.log(`   Expected server at: ${BASE_URL}\n`);
            return;
        }

        // Test Categories
        await this.testBasicEndpoints();
        await this.testSearchEndpoints();
        await this.testFuzzySearchEndpoints();
        await this.testCitySearchEndpoints();
        await this.testRunwayEndpoints();
        await this.testFormatOptions();
        
        this.printSummary();
    }

    async testBasicEndpoints() {
        console.log('\n📋 BASIC ENDPOINTS');
        console.log('==================');
        
        await this.testEndpoint('Database Info', `${API_BASE}/airports/info`);
        await this.testEndpoint('Country Statistics', `${API_BASE}/airports/stats/countries`);
        await this.testEndpoint('Airports by Country - Germany', `${API_BASE}/airports/country/DE?limit=5`);
        await this.testEndpoint('Large Airports', `${API_BASE}/airports/type/large_airport?limit=5`);
        await this.testEndpoint('Airport by ICAO - Heathrow', `${API_BASE}/airports/icao/EGLL`);
        await this.testEndpoint('Airport by IATA - Munich', `${API_BASE}/airports/iata/MUC`);
    }

    async testSearchEndpoints() {
        console.log('\n🔍 SEARCH ENDPOINTS');
        console.log('===================');
        
        await this.testEndpoint('Basic Search - London', `${API_BASE}/airports/search?q=London&limit=5`);
        await this.testEndpoint('Nearby Airports - Paris', `${API_BASE}/airports/nearby?lat=48.8566&lng=2.3522&radius=1.0&limit=5`);
        await this.testEndpoint('Search Suggestions', `${API_BASE}/airports/suggestions?q=EG&limit=10`);
    }

    async testFuzzySearchEndpoints() {
        console.log('\n🧠 FUZZY SEARCH ENDPOINTS');
        console.log('=========================');
        
        await this.testEndpoint('Fuzzy Search - EGKL (typo)', `${API_BASE}/airports/fuzzy?q=EGKL&limit=5&details=true`);
        await this.testEndpoint('Fuzzy Search - LFGP (transposition)', `${API_BASE}/airports/fuzzy?q=LFGP&limit=5`);
        await this.testEndpoint('Smart ICAO Search - EGKL', `${API_BASE}/airports/smart-icao?q=EGKL&limit=5`);
        await this.testEndpoint('Fuzzy Search - Heathro (name typo)', `${API_BASE}/airports/fuzzy?q=Heathro&limit=5`);
    }

    async testCitySearchEndpoints() {
        console.log('\n🏙️ CITY SEARCH ENDPOINTS');
        console.log('========================');
        
        await this.testEndpoint('City Search - London', `${API_BASE}/airports/city?q=London&limit=5`);
        await this.testEndpoint('City Search - Parris (typo)', `${API_BASE}/airports/city?q=Parris&limit=5&fuzzy=true`);
        await this.testEndpoint('City Search - Frankfrt (typo)', `${API_BASE}/airports/city?q=Frankfrt&limit=5`);
        await this.testEndpoint('City Search - Munich', `${API_BASE}/airports/city?q=Munich&limit=3`);
    }

    async testRunwayEndpoints() {
        console.log('\n🛫 RUNWAY DATA ENDPOINTS');
        console.log('========================');
        
        await this.testEndpoint('Runway Data - EGLL', `${API_BASE}/runway/EGLL`);
        await this.testEndpoint('Runway Data - EDDF', `${API_BASE}/runway/EDDF`);
        await this.testEndpoint('Runway Data - LFPG', `${API_BASE}/runway/LFPG`);
    }

    async testFormatOptions() {
        console.log('\n📄 FORMAT OPTIONS');
        console.log('=================');
        
        await this.testEndpoint('City Search - Simple Format', `${API_BASE}/airports/city?q=London&limit=3&format=simple`);
        await this.testEndpoint('Fuzzy Search - Simple Format', `${API_BASE}/airports/fuzzy?q=Munich&limit=3&format=simple`);
        await this.testEndpoint('City Search - Full Format', `${API_BASE}/airports/city?q=Paris&limit=3&format=full`);
    }

    printSummary() {
        console.log('\n📊 TEST SUMMARY');
        console.log('===============');
        console.log(`✅ Passed: ${this.passed}/${this.total}`);
        console.log(`❌ Failed: ${this.failed}/${this.total}`);
        
        const successRate = (this.passed / this.total * 100).toFixed(1);
        console.log(`📈 Success Rate: ${successRate}%`);
        
        if (this.failed === 0) {
            console.log('🎉 All tests passed! API is working perfectly.');
        } else if (successRate >= 80) {
            console.log('✨ Most tests passed! API is working well with minor issues.');
        } else {
            console.log('⚠️ Several tests failed. Please check the server and endpoints.');
        }
        
        console.log(`\n🌐 Demo available at: ${BASE_URL}/demo`);
    }
}

// Run tests if called directly
if (require.main === module) {
    const tester = new APITester();
    tester.runAllTests().catch(console.error);
}

module.exports = APITester;