import axios from 'axios';

export const IpService = {
  /**
   * Get the device's public IP address
   * uses api.ipify.org
   */
  getPublicIp: async (): Promise<string | null> => {
    try {
      const response = await axios.get('https://api.ipify.org?format=json', {
        timeout: 5000,
      });
      if (response.status === 200 && response.data?.ip) {
        return response.data.ip;
      }
      return null;
    } catch (error) {
      console.warn('Failed to fetch public IP:', error);
      return null;
    }
  }
};
