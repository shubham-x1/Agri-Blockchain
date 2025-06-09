const fs = require("fs");
const path = "./deployedAddress.json"; 

async function main() {
    const Trade = await ethers.getContractFactory("Trade");
    const trade = await Trade.deploy();
    await trade.waitForDeployment();

    console.log("Deployment object:", trade);

    const contractAddress = await trade.getAddress();
    console.log(`Contract deployed to: ${contractAddress}`);

    fs.writeFileSync(path, JSON.stringify({ address: contractAddress }, null, 2));
}

main().catch((error) => {
    console.error("Deployment failed:", error);
    process.exit(1);
});
