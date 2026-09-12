import { ProductSystemRequestSchema, type ProductSystemRequest, type ProductSystemOutput } from './types.js'
import { toTitleCase } from './utils.js'
import { normalizeBrief } from './normalization.js'
import { buildBlueprint } from './blueprint.js'
import { selectRepos } from './repo-selector.js'
import { buildArchitecture } from './architecture.js'
import { buildContracts } from './contracts.js'
import { buildScores } from './scoring.js'
import { buildCompositionExplanation } from './explanation.js'
import { makeBuildStarter } from './scaffold.js'

export function resolveFactoryIdea(input: { industry?: string; idea?: string; fields?: string[] }): string {
  const idea = input.idea?.trim()
  if (idea) return idea

  const industry = input.industry?.trim() || 'general business'
  const fieldText = (input.fields || []).filter(Boolean).join(', ')
  return fieldText
    ? `${toTitleCase(industry)} workflow platform with ${fieldText}`
    : `${toTitleCase(industry)} workflow orchestration platform`
}

export async function composeProductSystem(input: ProductSystemRequest): Promise<ProductSystemOutput> {
  const parsed = ProductSystemRequestSchema.parse(input)
  const brief = normalizeBrief(parsed)
  const blueprint = buildBlueprint(brief)
  const selected = await selectRepos(brief, blueprint)
  const architecture = buildArchitecture(selected, blueprint)
  const contracts = buildContracts(blueprint, selected)
  const scores = buildScores(selected, brief)
  const compositionExplanation = buildCompositionExplanation(blueprint, selected, brief, scores)
  const starter = makeBuildStarter(selected, blueprint)

  return {
    product_name: blueprint.productName,
    industry: brief.industry,
    problem: blueprint.problem,
    solution: blueprint.solution,
    selected_repos: selected,
    architecture,
    contracts,
    scores,
    composition_explanation: compositionExplanation,
    final_output: `${blueprint.finalOutput} ${blueprint.userOutcome}`,
    build_starter: starter,
  }
}
