import { Leagues, SeasonTypes, Sports } from '../types/enum.js';
import { InputSchema, ParsedInput } from '../types/base.js';

export const getDatesBetween = (startDateString: string, endDateString: string) => {
    const rangeEndDate = new Date(endDateString);
    const currentDate = new Date(startDateString);
    const todayDate = new Date();

    // Ending always on today's date or sooner
    const endDate = todayDate < rangeEndDate ? todayDate : rangeEndDate;

    const days = [];
    while (currentDate <= endDate) {
        const monthString = (currentDate.getMonth() + 1).toString().padStart(2, '0');
        const dayString = currentDate.getDate().toString().padStart(2, '0');
        const formattedDate = `${currentDate.getFullYear()}${monthString}${dayString}`;
        days.push(formattedDate);

        // Add 1 day
        currentDate.setDate(currentDate.getDate() + 1);
    }

    return days;
};

export const parseInput = (input: InputSchema): ParsedInput => {
    if (!input) throw new Error('Input not provided.');

    const scrapeMatchList = input.scrapeMatchList ?? false;
    const matchListYears = input.matchListYears ?? [];
    const matchListSeasonTypes = input.matchListSeasonTypes ?? [];
    const matchListLeagues = input.matchListLeagues ?? [];
    const scrapeMatchDetails = input.scrapeMatchDetails ?? false;
    const detailMatches = input.detailMatches ?? [];
    const matchDetailsLeague = input.matchDetailsLeague ?? null;
    const scrapeNews = input.scrapeNews ?? false;
    const newsLeague = input.newsLeague ?? null;

    const parsedYears = matchListYears.map((year) => parseInt(year, 10));

    const parsedSeasonTypes = matchListSeasonTypes.map((seasonType) => {
        if (!isEnumType<SeasonTypes>(seasonType)) {
            throw new Error('Provided invalid matchListSeasonTypes input');
        }
        return seasonType as SeasonTypes;
    });

    const parsedLeagues = matchListLeagues.map((league) => {
        if (!isEnumType<Leagues>(league)) {
            throw new Error('Provided invalid matchListLeagues input');
        }
        return league as Leagues;
    });

    const parsedGames = detailMatches
        .map((rawMatchInput) => getGameIdFromInput(rawMatchInput))
        .filter((gameId) => (gameId !== null)) as number[];

    if (scrapeMatchDetails && !matchDetailsLeague) {
        throw new Error('For game details scraping you have to provide gameDetailsLeague input');
    }

    if (matchDetailsLeague && !isEnumType<Leagues>(matchDetailsLeague as Leagues)) {
        throw new Error('Provided invalid matchDetailsLeague input');
    }

    const matchDetailsSport = getSportByLeague(matchDetailsLeague);

    if (!isEnumType<Leagues>(newsLeague)) {
        throw new Error('Provided invalid newsLeague input');
    }

    if (scrapeNews && !newsLeague) {
        throw new Error('For article scraping you have to provide newsLeague input');
    }

    return {
        scrapeMatchList,
        matchListYears: parsedYears,
        matchListSeasonTypes: parsedSeasonTypes,
        matchListLeagues: parsedLeagues,
        scrapeMatchDetails,
        detailMatches: parsedGames,
        matchDetailsLeague,
        matchDetailsSport,
        scrapeNews,
        newsLeague,
    };
};

export const getSportByLeague = (league: Leagues) => {
    const mappings = {
        [Leagues.MLB]: Sports.Baseball,
        [Leagues.NHL]: Sports.Hockey,
        [Leagues.NBA]: Sports.Basketball,
        [Leagues.WNBA]: Sports.Basketball,
        [Leagues.CollegeBasketballMen]: Sports.Basketball,
        [Leagues.CollegeBasketballWomen]: Sports.Basketball,
        [Leagues.NFL]: Sports.Football,
    };

    return mappings[league];
};

const getGameIdFromInput = (rawGameInput: string): number | null => {
    // rawGameInput might be ID or url
    if (!Number.isNaN(Number(rawGameInput))) return parseInt(rawGameInput, 10);

    // URLs might be in two formats
    // URL in format https://www.espn.com/mlb/recap?gameId={id}
    const url = new URL(rawGameInput);

    if (url.searchParams.has('gameId')) {
        const gameId = url.searchParams.get('gameId');
        return parseInt(gameId as string, 10);
    }

    // URL in format: https://www.espn.com/mlb/{type_of_view}/_/gameId/401444866
    const splitPathname = url.pathname.split('/');
    if (splitPathname.length === 0) return null;

    const gameId = splitPathname[splitPathname.length - 1];
    if (!Number.isNaN(Number(gameId))) return parseInt(gameId, 10);

    return null;
};

const isEnumType = <T>(e: T) => (token: unknown): token is T[keyof T] => Object.values(e).includes(token as T[keyof T]);
