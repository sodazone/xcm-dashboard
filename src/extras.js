import { createStewardAgent } from "@sodazone/ocelloids-client";

const BASE_CDN =
	"https://cdn.jsdelivr.net/gh/sodazone/intergalactic-asset-metadata";
const BASE_ASSETS_URL = BASE_CDN + "/v2";

const cacheAssetIcons = {};
const cacheChainIcons = {};

let AssetIcons;
let ChainIcons;
let NetworkInfos;

const EthereumChains = [
	{
		runtimeChain: "Ethereum Mainnet",
		ss58Prefix: 0,
		chainDecimals: [18],
		chainTokens: ["ETH"],
		existentialDeposit: "0",
		urn: "urn:ocn:ethereum:1",
	},
	{
		runtimeChain: "Ethereum Sepolia (Testnet)",
		ss58Prefix: 0,
		chainDecimals: [18],
		chainTokens: ["ETH"],
		existentialDeposit: "0",
		urn: "urn:ocn:ethereum:11155111",
	},
];

async function fetchNetworkInfos() {
	const networkMap = {};
	const steward = createStewardAgent({
		apiKey:
			"eyJhbGciOiJFZERTQSIsImtpZCI6Im92SFVDU3hRM0NiYkJmc01STVh1aVdjQkNZcDVydmpvamphT2J4dUxxRDQ9In0.ewogICJpc3MiOiAiYXBpLm9jZWxsb2lkcy5uZXQiLAogICJqdGkiOiAiMDEwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAiLAogICJzdWIiOiAicHVibGljQG9jZWxsb2lkcyIKfQo.qKSfxo6QYGxzv40Ox7ec6kpt2aVywKmhpg6lue4jqmZyY6y3SwfT-DyX6Niv-ine5k23E0RKGQdm_MbtyPp9CA",
	});

	async function doFetch(cursor) {
		const { items, pageInfo } = await steward.query(
			{
				op: "chains.list",
			},
			{ limit: 100, cursor },
		);
		for (const chainInfo of items) {
			networkMap[chainInfo.urn] = chainInfo;
		}
		if (pageInfo?.hasNextPage) {
			await doFetch(pageInfo.endCursor);
		}
		for (const ethChain of EthereumChains) {
			networkMap[ethChain.urn] = ethChain;
		}
		return networkMap;
	}

	return doFetch();
}

export async function loadExtraInfos() {
	const fetchAssetsExtra = async () => {
		const response = await fetch(BASE_CDN + "/assets-v2.json");
		return await response.json();
	};
	const fetchNetworksExtra = async () => {
		const response = await fetch(BASE_CDN + "/chains-v2.json");
		return await response.json();
	};
	const [assetsExtras, chainsExtras, networkInfos] = await Promise.all([
		fetchAssetsExtra(),
		fetchNetworksExtra(),
		fetchNetworkInfos(),
	]);
	AssetIcons = assetsExtras.items;
	ChainIcons = chainsExtras.items;
	NetworkInfos = networkInfos;
}

export function resolveNetworkIcon(networkUrn) {
	if (cacheChainIcons[networkUrn]) {
		return cacheChainIcons[networkUrn];
	}

	const urnParts =
		networkUrn.indexOf(":") > 0
			? networkUrn.split(":")
			: ["", "", networkUrn, "0"];
	const path = `${urnParts[2]}/${urnParts[3]}`;
	const icon = ChainIcons.find((p) => {
		return p.substring(0, p.lastIndexOf("/")) === path;
	});

	cacheChainIcons[networkUrn] = icon ? `${BASE_ASSETS_URL}/${icon}` : "#";

	return cacheChainIcons[networkUrn];
}

export function resolveNetworkName(networkUrn) {
	return NetworkInfos[networkUrn]?.runtimeChain;
}

export function resolveAssetIcon(key) {
	if (cacheAssetIcons[key]) {
		return cacheAssetIcons[key];
	}

	if (key.indexOf("|") < 0) {
		return;
	}

	const [chainId, assetId] = key.split("|");
	const path =
		`${chainId.substring(8).split(":").join("/")}/assets/${assetId.split(":").join("/")}`.toLowerCase();

	const icon = AssetIcons.find((p) => {
		return p.substring(0, p.lastIndexOf("/")) === path;
	});

	cacheAssetIcons[key] = icon ? `${BASE_ASSETS_URL}/${icon}` : undefined;
	return cacheAssetIcons[key];
}
