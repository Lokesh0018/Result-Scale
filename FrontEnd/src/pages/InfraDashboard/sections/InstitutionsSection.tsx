// ─── Institutions Section ─────────────────────────────────────────────────────
import { InstitutionsTable } from '../components/InstitutionsTable'
import { TrafficMap } from '../components/TrafficMap'
import type { Institution, RegionNode } from '../types'

interface Props {
  institutions: Institution[]
  regions: RegionNode[]
}

export function InstitutionsSection({ institutions, regions }: Props) {
  return (
    <div className="infra-section">
      <InstitutionsTable institutions={institutions} />
      <TrafficMap regions={regions} />
    </div>
  )
}
