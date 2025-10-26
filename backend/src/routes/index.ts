import { Router } from 'express';
import profileRouter from '../modules/profile/profile.router';
import nftRouter from '../modules/nft/nft.router';
import listingRouter from '../modules/listing/listing.router';
import toolboxRouter from '../modules/toolbox/toolbox.router';
import feedRouter from '../modules/transactions/transaction-feed.router';

const router = Router();

router.use('/profiles', profileRouter);
router.use('/nfts', nftRouter);
router.use('/listings', listingRouter);
router.use('/toolbox', toolboxRouter);
router.use('/feed', feedRouter);

export default router;
