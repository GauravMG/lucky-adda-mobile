import { fetchWalletList } from '../services/walletService';
import { getItem } from '../utils/storage';
import { formatToTwoDigits } from '../utils/textHelper';

export const fetchUserCurrentBalance = async () => {
  try {
    const userData = await getItem('userData');
    if (!userData.userId) {
      return 0;
    }

    const { success, stats, data } = await fetchWalletList({
      filter: {
        userId: userData.userId,
      },
      range: {
        all: true,
      },
      sort: [
        {
          orderBy: 'walletId',
          orderDir: 'asc',
        },
      ],
    });

    const balance = success ? stats.totalbalance ?? 0 : 0;

    return formatToTwoDigits(Number(balance));
  } catch (error) {
    throw error;
  }
};
