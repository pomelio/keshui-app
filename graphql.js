import axios from 'axios';

export default class GraphQLClient {
  constructor(url, headers = {}) {
    this.url = url;
    this.headers = headers;
  }

  async query(query, variables = {}) {
    return this.request({ query, variables });
  }

  async mutate(mutation, variables = {}) {
    return this.request({ query: mutation, variables });
  }

  async request(body) {
    try {
      const response = await axios.post(this.url, body, {
        headers: {
          'Content-Type': 'application/json',
          ...this.headers,
        },
      });

      if (response.data.errors) {
        throw new Error(response.data.errors.map(error => error.message).join('\n'));
      }

      return response.data.data;
    } catch (error) {
      console.error('GraphQL request failed', error);
      throw 'graphql error.';
    }
  }
}
