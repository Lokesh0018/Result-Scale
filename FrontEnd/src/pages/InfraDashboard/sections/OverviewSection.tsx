// ─── Overview Section ─────────────────────────────────────────────────────────
import { MetricCards } from '../components/MetricCards'
import { TrafficChart } from '../components/TrafficChart'
import { InstitutionsTable } from '../components/InstitutionsTable'
import { EventFeed } from '../components/EventFeed'
import { TrafficMap } from '../components/TrafficMap'
import type { MetricCard, Institution, InfraEvent, TrafficDataPoint, RegionNode } from '../types'

interface Props {
  metrics: MetricCard[]
  institutions: Institution[]
  events: InfraEvent[]
  trafficHistory: TrafficDataPoint[]
  regions: RegionNode[]
}

export function OverviewSection({ metrics, institutions, events, trafficHistory, regions }: Props) {
  return (
    <div className="infra-section">
      <MetricCards metrics={metrics} />

      <div className="infra-two-col">
        <TrafficChart data={trafficHistory} />
        <TrafficMap regions={regions} />
      </div>

      <div className="infra-two-col infra-two-col-wide">
        <InstitutionsTable institutions={institutions} />
        <EventFeed events={events} />
      </div>
    </div>
  )
}
