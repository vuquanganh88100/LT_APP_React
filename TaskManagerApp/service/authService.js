import { postRequest } from '../config/apiCaller';
import { apiPath } from '../config/apiPath';
import AsyncStorage from '@react-native-async-storage/async-storage';

const authService = {
    login: async (credentials, successCallback, errorCallback) => {
        const user = await postRequest  (
            apiPath.login,
            credentials,
            async (data) => {
                await AsyncStorage.setItem('user', JSON.stringify(data));
                if (successCallback) successCallback(data);
            },
            errorCallback
        );
        return user;
    },

    register: async (userData, successCallback, errorCallback) => {
        return await postRequest(
            apiPath.register, 
            userData, 
            successCallback, 
            errorCallback);
    },

    logout: async () => {
        await AsyncStorage.removeItem('user');
    },

    getCurrentUser: async () => {
        const user = await AsyncStorage.getItem('user');
        return user ? JSON.parse(user) : null;
    },
};

export default authService;
