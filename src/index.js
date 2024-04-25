import { promises as fs } from "fs"
import fetch from "node-fetch"

import { TEMPLATE_PLACEHOLDERS } from "./constants.js"

// User @jotagep id
const GITHUB_USER = "jotagep"

async function getLastStarredRepos(username, number = 3) {
	try {
		const response = await fetch(
			`https://api.github.com/users/${username}/starred?per_page=${number}`
		)

		const data = await response.json()
		return data
	} catch (error) {
		console.error("Error fetching starred repos:", error)
	}
}

;(async () => {
	const [template, starredRepos] = await Promise.all([
		fs.readFile("./src/README.md.tpl", { encoding: "utf-8" }),
		getLastStarredRepos(GITHUB_USER, 3),
	])

	const latestStarredRepos = starredRepos
		.map(
			({ full_name: title, html_url: link, stargazers_count: stars }) =>
				`- [${title}](${link}) - ${stars} stars`
		)
		.join("\n")

	const date = new Date()

	const formattedDate = date.toUTCString()
	const parsedDate = formattedDate.split(",")[1]
	const updatedDate = parsedDate.replace("GMT", "UTC")

	//Replace template info
	const newMarkdown = template
		.replace(TEMPLATE_PLACEHOLDERS.LAST_STARRED_REPOS, latestStarredRepos)
		.replace(TEMPLATE_PLACEHOLDERS.UPDATED_AT, updatedDate)

	await fs.writeFile("README.md", newMarkdown)
})()
