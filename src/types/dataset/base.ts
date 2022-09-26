import { ResultTypes } from '../enum.js';

export type VenueData = {
    capacity: number,
    fullName: string,
    city: string,
    state: string,
}

export interface CompetitorData {
    id: string,
    displayName: string,
    abbreviation: string,
    winner: boolean | null,
    home: boolean,
    score: number,
}

export interface CompetitionData {
    id: string,
    date: string,
    competitors: CompetitorData[],
    attendance: number,
    headlines: {
        long: string,
        short: string,
    }[],
    venue: VenueData | null,
    winnerAbbreviation: string | null,
}

export interface MatchPlayerData {
    id: string,
    statType?: string,
    position: string,
    stats: Record<string, string>,
    team: string,
    name: string,
}

export interface MatchDetailData extends CompetitionData {
    officials: string[],
    players: MatchPlayerData[],
    resultType: ResultTypes,
}
