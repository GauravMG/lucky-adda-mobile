import { post } from './apiClient';

export const fetchGameList = async (params) => {
  try {
    return post('/game/list', params);
  } catch (error) {
    throw error;
  }
};

export const fetchResultList = async (params) => {
  try {
    return post('/game/list-result', params);
  } catch (error) {
    throw error;
  }
};

export const placeBet = async (params) => {
  try {
    return post('/game/save-user-bet', params);
  } catch (error) {
    throw error;
  }
};

export const fetchUserBetList = async (params) => {
  try {
    return post('/game/list-user-bet', params);
  } catch (error) {
    throw error;
  }
};

export const fetchResultChartList = async (params) => {
  try {
    return post('/game/list-result-chart', params);
  } catch (error) {
    throw error;
  }
};
