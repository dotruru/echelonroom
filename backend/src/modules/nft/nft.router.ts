import { Router } from 'express';
import {
  getMyNfts,
  mintNft,
  getNftDetails,
  getNftBidsController,
  getNftTransactionsController,
} from './nft.controller';

const router = Router();

router.get('/mine', getMyNfts);
router.post('/', mintNft);
router.get('/:nftId', getNftDetails);
router.get('/:nftId/bids', getNftBidsController);
router.get('/:nftId/transactions', getNftTransactionsController);

export default router;
