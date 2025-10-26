import { Router } from 'express';
import {
  listActiveListings,
  createListing,
  purchaseListingController,
  placeBidController,
  acceptBidController,
} from './listing.controller';

const router = Router();

router.get('/', listActiveListings);
router.post('/', createListing);
router.post('/:listingId/purchase', purchaseListingController);
router.post('/:listingId/bids', placeBidController);
router.post('/:listingId/bids/:bidId/accept', acceptBidController);

export default router;
