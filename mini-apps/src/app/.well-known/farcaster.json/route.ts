export async function GET() {
	const appUrl = process.env.NEXT_PUBLIC_APP_URL || "https://mini-apps-orcin.vercel.app";

	console.log(`Server running at: ${appUrl}`);

	const config = {
		accountAssociation: {
			header:
				"eyJmaWQiOjE5NjY0OCwidHlwZSI6ImN1c3RvZHkiLCJrZXkiOiIweGUzMTNGMDlDM2RkMzAzRjAzMzQ4QzA3N0NERjA2NEE5ZGY2MjI2NjIifQ",
			payload: "eyJkb21haW4iOiJtaW5pLWFwcHMtb3JjaW4udmVyY2VsLmFwcCJ9",
			signature:
				"MHg2MGRjZTQwMWQwMTZkYTZlNDYxMzZiZDM1Y2U2NzE2YWUzYjgwMmRhYTZiN2E0Y2VkYzU5NTE1ZjQ4ZDA1OGFiNmE5YjNiMzI4YTc2YWZiNTAwODg0MjA4Zjc4OWRmZjgwMGEzZTM2ZWQyOGUwZmM5ZmUyNzlmNGY3M2E2YjFkODFi",
		},
		frame: {
			version: "next",
			name: "Farcaster OG Migration",
			iconUrl: `${appUrl}/FarcasterOG.png`,
			homeUrl: `${appUrl}`,
			imageUrl: `${appUrl}/FarcasterOG.png`,
			buttonTitle: "Migrate Your OG NFT",
			splashImageUrl: `${appUrl}/FarcasterOG.png`,
			splashBackgroundColor: "#18181B",
			description:
				"Migrate your Farcaster OG NFT from Zora to Base. Celebrating Farcaster at permissionless.",
			tags: ["nft", "collectibles", "base", "migration", "farcaster"],
			tagline: "Migrate OG NFT to Base",
		},
	};

	return Response.json(config);
}

