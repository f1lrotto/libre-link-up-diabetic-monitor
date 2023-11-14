/* eslint-disable quote-props */
const axios = require('axios');
// const fs = require('fs');
const moment = require('moment-timezone');

// moment.tz.setDefault('Europe/Bratislava');
// API URL to get the data from
const LIBRE_API = 'https://api-eu.libreview.io';


class LibreClient {
  constructor(email, password) {
    this.email = email;
    this.password = password;
    this.token = null;
    this.patientId = null;

    this.glucseTrendMap = {
      1: 'SharpFall',
      2: 'Fall',
      3: 'Stable',
      4: 'Rise',
      5: 'SharpRise',
    };

    // general headers for the requests to the API
    this.LIBRE_HEADERS = {
      'accept-encoding': 'gzip',
      'cache-control': 'no-cache',
      'connection': 'Keep-Alive',
      'content-type': 'application/json',
      'product': 'llu.android',
      'version': '4.7.0',
    };

    this.convertMGtoMMOL = (mg) => mg / 18;
    this.sensorDataObjConverter = (obj, trendIncluded = true) => ({
      glucoseMMOL: obj.Value,
      glucoseMG: obj.ValueInMgPerDl,
      isLow: obj.isLow,
      isHigh: obj.isHigh,
      timestamp: moment(obj.Timestamp, 'MM/DD/YYYY h:mm:ss A'),
      trendNumber: trendIncluded ? obj.TrendArrow : null,
      trend: trendIncluded ? this.glucseTrendMap[obj.TrendArrow] : null,
    });

    this.login().then(() => this.setSettings());
  }

  async getAccountToken() {
    console.info(`Attempting to login with email ${this.email}...`);
    // make a POST request to the login endpoint /llu/auth/login
    // with the email and password as JSON body
    const response = await axios.post(`${LIBRE_API}/llu/auth/login`, {
      email: this.email,
      password: this.password,
    }, {
      headers: this.LIBRE_HEADERS,
    });

    if (response.status !== 200) {
      throw new Error('Login failed. Check your credentials.');
    }

    // save data from the response
    this.id = response.data.data.user.id;
    this.firstName = response.data.data.user.firstName;
    this.lastName = response.data.data.user.lastName;
    this.token = response.data.data.authTicket.token;

    // add token to the headers
    console.info(`Logged in as ${this.firstName} ${this.lastName}. Welcome to the Libre API!`);
  }

  async login() {
    console.info(`Attempting to get patient ID for user ${this.firstName}...`);

    // Call the login method to get the authToken
    await this.getAccountToken();

    // Make a GET request to the /llu/connections endpoint with the authToken
    const response = await axios.get(`${LIBRE_API}/llu/connections`, {
      headers: {
        ...this.LIBRE_HEADERS,
        authorization: `Bearer ${this.token}`,
      },
    });

    if (response.status !== 200) {
      throw new Error('Failed to get patient ID.');
    }

    this.patientId = response.data.data[0].patientId;
    console.info(`Got patient ID ${this.firstName}.`);
  }


  // can only be called after JWT token and patientID is retrieved
  async getCGMData() {
    console.info(`Attempting to get CGM data for patient ${this.firstName}...`);

    if (!this.token || !this.patientId) {
      throw new Error('You need to login first.');
    }

    // make a GET request to the /llu/connections/{patientId}/graph endpoint
    const response = await axios.get(`${LIBRE_API}/llu/connections/${this.patientId}/graph`, {
      headers: {
        ...this.LIBRE_HEADERS,
        authorization: `Bearer ${this.token}`,
      },
    });

    if (response.status !== 200) {
      throw new Error('Failed to get CGM data.');
    }
    // fs.writeFileSync('response.json', JSON.stringify(response.data));

    return response.data;
  }

  async setSettings() {
    const { data } = await this.getCGMData();
    const { connection, activeSensors } = data;

    this.sensorActivated = activeSensors[0].sensor.a;
    this.sensorExpiration = activeSensors[0].sensor.a + (86400 * 14); // add 14 days in seconds

    const { alarmRules } = connection;
    this.alarmValues = {
      low: alarmRules.l.thmm,
      high: alarmRules.h.thmm,
    };
  }

  async getLastReading() {
    const { data: { connection: { glucoseMeasurement } } } = await this.getCGMData();

    return this.sensorDataObjConverter(glucoseMeasurement);
  }

  // readings in 15 minute intervals for the last 12h
  async getGraphData() {
    const { data: { graphData } } = await this.getCGMData();

    const convertedGraphData = graphData.map((obj) => this.sensorDataObjConverter(obj, false));
    return convertedGraphData;
  }
}

module.exports = LibreClient;

