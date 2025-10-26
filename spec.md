# the echelon room

## Overview
A full-stack NFT marketplace application that allows users to mint, buy, sell, and bid on NFTs with user authentication, plus a comprehensive steganography and cryptographic tool suite. The application features a dark, cyber-intelligence dashboard design inspired by covert ops terminals with a minimalist, data-driven, classified-surveillance aesthetic.

## Visual Design Theme
The application uses a dark cyber-intelligence theme with:
- Background: black gradient (#000000–#0A0A0A)
- Text: light gray (#E0E0E0) for primary text, muted gray for secondary information
- Accent color: red (#FF2A2A) for highlights, alerts, and interactive elements
- Typography: monospace fonts (IBM Plex Mono or JetBrains Mono)
- Animations: subtle pulses, slow rotations, fading transitions
- Interactive elements: red glow or underline on hover, outlined red buttons with glow effects
- Overall tone: secretive, analytical, high-tech command console aesthetic

## Layout Structure

### Landing Page
- Features the rotating globe map with red target markers as the central visual element using a transparent background globe image
- The globe visual integrates seamlessly with the landing page background without any black square or solid background
- Includes faint grid lines and short region information text
- Implements subtle pulse animations and slow rotation effects
- Provides an "Enter Command" control that transitions into the dashboard experience without third-party login requirements
- Displays the application title "the echelon room" without any additional descriptive text

### Dashboard Layout
The main application implements a three-panel dashboard layout:

#### Left Panel
- Displays agent details, user stats, and activity metrics
- Uses gray text with red highlights for important information
- Shows user profile information, owned NFTs count, active bids, and transaction history
- Contains a "Toolbox" section underneath the agent profile with:
  - A plus (+) button to add new rows
  - Each row containing an editable label field and a content field
  - Content field is a text input with a "Paste" button for clipboard functionality
  - Users can edit labels to describe each piece of data
  - All styling matches the cyber-intelligence theme with white lines, monospace font, and cyber-glow effects

#### Center Panel
- Main content area for NFT displays, marketplace listings, and tool interfaces
- Displays the primary application content based on selected navigation tab

#### Right Panel
- Contains a live, animated transaction feed showing real-time marketplace activity
- Displays messages like "Puzzle [hash] solved by [codename]" with timestamps
- Updates automatically as new transactions occur in the marketplace
- Shows recent NFT purchases, sales, bids, and minting activities with cryptographic-style formatting

### Responsive Design
- Desktop: full three-panel layout as described above
- Mobile: panels stack vertically for optimal mobile viewing experience

## Authentication
- Core marketplace and Escape Tools interactions are accessible without Internet Identity (ICP) authentication.
- Optional agent profile setup is handled within the application for personalization.

## Core Features

### NFT Minting with Steganography and Encryption (Puzzle Studio Page)
- The "Puzzle Studio" page features a comprehensive encoding interface with tabbed navigation for different encoding tools
- Image Encoding tab includes:
  - Image upload functionality for encoding
  - Secret message input field
  - Encryption options before encoding:
    - AES-256 encryption with user-defined passphrase
    - XOR encryption with user-defined passphrase
    - Option to embed message without encryption
  - Adjustable bit depth selection (1-4 bits) via slider control for encoding strength
  - Real-time preview of the encoded image as settings are adjusted
  - Download functionality to save the encoded image
- Bit Plane Overlay tab includes:
  - Primary image upload functionality
  - Secondary overlay option with two modes:
    - Image overlay: upload a secondary image to hide in the bit plane
    - Text overlay: enter a word or text to hide in the bit plane
  - Bit plane selection (1-4) to specify which bit plane to use for hiding the overlay
  - Real-time preview showing the result with the overlay embedded
  - The overlay is only visible when viewed through the bit plane viewer in Escape Tools
  - Download functionality to save the modified image with hidden overlay
- Cipher Tools tab includes encoding utilities:
  - Hash generators: SHA256, SHA1, MD5 with text input
  - Text encoders: Base64, Hex, Binary conversion
  - Classic cipher encoding: Caesar cipher, Vigenère cipher, XOR cipher
  - AES-256 encryption and decryption tools with passphrase input
  - Copy to clipboard and export functionality for all outputs
  - Clear input/output controls for each tool
- Users can provide NFT metadata (name, description) to mint the encoded image as an NFT
- Each minted NFT is assigned a unique identifier
- Minted NFTs are owned by the creator initially
- The uploaded and encoded image data is stored in the backend and associated with the NFT

### NFT Trading
- Users can list their NFTs for sale with a fixed price
- Users can purchase listed NFTs at the asking price
- Ownership transfers automatically upon successful purchase
- Users can remove their listings if not sold

### Bidding System
- Users can place bids on any NFT (listed or not listed)
- NFT owners can accept or reject bids
- Users can view and manage their active bids
- Bids can be withdrawn by the bidder

### User Profiles
- Users can view their owned NFTs
- Users can see their active listings
- Users can manage their placed bids
- Users can view their sales history

### NFT Detail View
- Users can click on their owned NFTs to open a detailed view in a wider modal for better content display
- The detailed view displays:
  - Current offers/bids on the NFT
  - Transaction history showing ownership changes and price history
  - Current listing price (if listed for sale)
  - A download button that allows users to download the displayed NFT image

### NFT Display
- NFTs display their actual uploaded images in grid and detail views
- The frontend fetches the correct image blob data from the backend for each NFT
- If no image is available, a placeholder image is shown as fallback
- Image rendering works consistently across all NFT display components

### My NFTs Page
- In the "My NFTs" page, each NFT card displays an ownership tag and an "unsolved" tag to indicate the NFT's puzzle status
- Each NFT card includes a "Solve" button that opens the NFT's image directly in the Escape Tools (Decode tab) for steganography analysis
- The "Solve" button and "unsolved" tag follow the cyber-intelligence theme with red accents and proper styling

### Toolbox
- Located in the left panel underneath the agent profile
- Users can add new rows using the plus (+) button
- Each row contains:
  - An editable label field for describing the data
  - A content field (text input) for storing information
  - A "Paste" button that allows users to paste content from their clipboard
- All toolbox data is persisted per user
- Styling follows the cyber-intelligence theme with white lines, monospace font, and cyber-glow effects

### Escape Tools
A comprehensive steganography and cryptographic analysis tool suite with tabbed navigation for different tools. The Escape Tools section header displays as text-only without any accompanying images. The Escape Tools focuses on analysis and decoding tools only.

#### Shared Image Context
- When a user uploads an image in any Escape Tools tab, the image persists across all tabs (Decode, Cipher Tools, Image Forensics)
- Users can switch between tabs without losing the uploaded image
- A clear/reset button is available to remove or replace the uploaded image
- The uploaded image serves as context for all relevant analysis tools across tabs

#### Decode Tool
- Users can upload an image to extract hidden messages
- Bit depth selection matching the encoding parameters
- Optional passphrase input for decrypting extracted messages (AES-256/XOR)
- Display of extracted message content
- Error handling for images without hidden content
- Can receive NFT images directly from the "My NFTs" page via the "Solve" button
- Uses LSB steganography implemented in the frontend

#### Cipher Tools
A collection of cryptographic analysis utilities:
- Hash generators: SHA256, SHA1, MD5 with text input
- Text decoders: Base64, Hex, Binary conversion
- Classic cipher analysis: Caesar cipher, Vigenère cipher analysis, XOR cipher decoding
- AES-256 decryption tool with passphrase input for analysis purposes
- Copy to clipboard and export functionality for all outputs
- Clear input/output controls for each tool

#### Image Forensics
Advanced image analysis tools:
- Histogram viewer displaying luminance and color channel distributions
- Bit layer visualization showing LSB overlays and bit plane analysis that can reveal overlays hidden using the Bit Plane Overlay tool
- EXIF metadata viewer extracting and displaying image metadata
- Entropy scanner highlighting areas with irregular data patterns
- Byte-level diff viewer for comparing original vs encoded images
- Visual indicators for potential steganographic content

## Navigation
- Main tab navigation includes: Marketplace, Puzzle Studio, Escape Tools, Profile
- Escape Tools contains internal tabbed navigation for: Decode, Cipher Tools, Image Forensics
- Puzzle Studio contains internal tabbed navigation for: Image Encoding, Bit Plane Overlay, Cipher Tools
- Escape Tools tab is positioned to the right of Puzzle Studio tab
- All navigation elements follow the cyber-intelligence theme with red accents and hover effects

## Backend Data Storage
- **On-chain sources of truth (Solana):**
  - NFTs: store mint address, collection, creators array, seller fee basis points, and metadata URI following Metaplex Token Metadata (standard, pNFT, or cNFT). Original media and JSON live on Arweave/IPFS; backend holds URIs only.
  - Listings & bids: marketplace state resides in program accounts/receipts (e.g., Metaplex Auction House PDAs). Price, seller, bidder, status, and timestamps are derived from these accounts and transaction logs.
  - Trophies/Achievements: issued as non-transferable reward tokens on Solana (Token-2022 with transfer restrictions or pNFT rule sets). Holder sets are the authoritative proof of puzzle completion.
- **Off-chain indices & gameplay state (backend):**
  - Marketplace index/cache: read-optimized tables that mirror on-chain listings, bids, sales, owners, floor snapshots, and recent transaction signatures for fast UI queries. Kept fresh via RPC/webhook log ingestion.
  - User ownership records: owner-to-asset index derived from on-chain token accounts, cached for quick `My NFTs` and profile loads.
  - Transaction history: normalized sale/list/bid/cancel/execute events with `{txSig, blocktime, from, to, price, mint}` for timelines and analytics.
  - NFT puzzle status: per `{wallet, mint}` run state (`solved:boolean`, `best_time_ms`, `attempts:int`, `hints_used:int`, `last_run_at`). On-chain Trophy is the canonical proof; these fields power UI and leaderboards.
  - Real-time feed buffer: rolling window of parsed Solana events (`list`, `bid`, `cancel`, `execute_sale`, `mint_trophy`) for the animated right-panel feed.
  - Credits ledger: fixed-price in-app balance with earn/spend history (hints, private rooms, cosmetics). Fiat/crypto top-ups reconcile into this ledger.
  - User toolbox data: per-user rows `{id, label, content, created_at, updated_at}` persisted for the left-panel toolbox.
  - Media cache/proxy: cached thumbnails and a proxy endpoint to serve image blobs to the frontend for consistency; source of truth remains Arweave/IPFS (backend stores URIs and short-lived cached blobs).

## Backend Operations
- Mint new NFTs with image data storage:
  - Upload encoded image to Arweave/IPFS and build metadata JSON (name, description, image, attributes).
  - Mint via Metaplex SDK (standard NFT, pNFT, or compressed NFT) while setting collection and royalties.
  - Persist mint address, metadata URI, and creator references in the marketplace index.
- Retrieve NFT image data by NFT identifier:
  - Resolve metadata URI to image URI and serve via media proxy/cache for stable frontend delivery.
  - Provide fallback placeholder and schedule revalidation if retrieval fails.
- Retrieve NFT metadata including puzzle status:
  - Combine on-chain metadata (name, description, attributes) with off-chain run state (`solved`, `best_time_ms`, etc.) for detail views and `My NFTs`.
- Create and manage listings:
  - Execute Auction House `sell`/`cancel` instructions, store receipt PDAs and transaction signatures, and update the index.
  - Validate ownership and approval before listing; reflect status changes in near real time.
- Process NFT purchases with transaction history recording:
  - Execute purchase flows (`buy` + `execute_sale`) through Auction House so ownership transfers on-chain.
  - Ingest logs and append normalized sale records `{txSig, price, buyer, seller, mint, time}` to the history index.
- Handle bid placement and acceptance:
  - Place/withdraw bids through Auction House bid flows and index active bids by mint.
  - Accept bids by executing sales against receipts; update bid status and sales history from on-chain events.
- Transfer NFT ownership with history tracking:
  - Subscribe to token account changes and sale receipts to detect transfers, writing human-readable entries to transaction history ordered by blocktime.
- Retrieve user's NFTs, bids, and listings:
  - Query owner index for mints, join with active listings/bids mirrored from on-chain sources, and include puzzle status for each `{wallet, mint}`.
- Get marketplace NFT listings with image data:
  - Serve paginated/filterable listings (collection, tier, mode, status) including proxy image URLs and current best bid/ask derived from on-chain mirrors.
- Retrieve NFT transaction history and current offers:
  - Return recent on-chain events (listings, bids, cancels, sales) and open offers for a mint with transaction signatures for auditability.
- Provide real-time transaction feed data for the live activity display:
  - Maintain WebSocket/SSE streams fed by Solana log subscriptions (Auction House, mint program, Trophy program) and push compact events for the right-panel feed.
- Generate cryptographic-style transaction messages with hashes and codenames:
  - Format messages as `[HH:MM:SS] EVT_CODE — short_msg — tx: <sig_prefix…>` (e.g., `PUZZLE_SOLVED`, `LIST`, `BID`, `SALE`, `TROPHY_MINTED`) using anonymized codenames mapped from wallet addresses.
- Update NFT puzzle status when solved:
  - Mint a non-transferable Trophy to the solver’s wallet on Solana, update off-chain run state (`solved=true`, `best_time_ms`, etc.), and optionally update metadata when dynamic art is enabled.
- Store and retrieve user toolbox data:
  - Provide CRUD endpoints scoped to the authenticated user, persisting rows `{id, label, content, created_at, updated_at}` and returning them for the left-panel toolbox.

## Language
The application content is displayed in English.
