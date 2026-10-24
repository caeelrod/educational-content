import type { Dir } from './market';

// Practice headlines. d and s say how the demand and supply curves for `market` shift
// (+1 right, −1 left, 0 not at all). Every answer and every piece of feedback is worked
// out from d and s, so an item only has to get those two right.
export type Headline = { market: string; text: string; d: Dir; s: Dir; why: string };

export const singles: Headline[] = [
 { market: 'Gasoline', text: 'A pipeline shutdown cuts the amount of gasoline delivered to the region.', d: 0, s: -1, why: 'Fewer gallons can reach stations, so sellers offer less at every price.' },
 { market: 'Gasoline', text: 'Many companies let employees work from home three days a week.', d: -1, s: 0, why: 'Fewer commutes means drivers want less gasoline at every price.' },
 { market: 'Gasoline', text: 'Drivers hear that gas prices will jump next week, so they fill up today.', d: 1, s: 0, why: 'Expecting a higher price later raises demand now.' },
 { market: 'Coffee', text: 'A drought in major coffee-growing countries damages the harvest.', d: 0, s: -1, why: 'Weather cuts how much coffee can be grown and sold at every price.' },
 { market: 'Coffee', text: 'A widely reported study links drinking coffee to a longer life.', d: 1, s: 0, why: 'A change in tastes: people want more coffee at every price.' },
 { market: 'Ice cream', text: 'A heat wave settles over the city for two weeks.', d: 1, s: 0, why: 'Hot weather makes people want more ice cream at every price. It changes buyers’ plans, not the cost of making ice cream.' },
 { market: 'Ice cream', text: 'The price of cream, a main ingredient, jumps.', d: 0, s: -1, why: 'A higher input cost makes each scoop costlier to produce, so sellers offer less at every price.' },
 { market: 'Umbrellas', text: 'The forecast calls for a week of rain.', d: 1, s: 0, why: 'Buyers want more umbrellas at every price.' },
 { market: 'Smartphones', text: 'A new factory makes phone chips much cheaper to produce.', d: 0, s: 1, why: 'Cheaper parts lower the cost of each phone, so makers offer more at every price.' },
 { market: 'Concert tickets', text: 'The band adds two more nights at the same arena.', d: 0, s: 1, why: 'More seats are for sale at every price.' },
 { market: 'Movie theater tickets', text: 'The most popular streaming service raises its monthly price.', d: 1, s: 0, why: 'Streaming is a substitute for going to the movies. When the substitute costs more, demand for theater tickets rises.' },
 { market: 'Hot dogs', text: 'The price of hot dog buns doubles.', d: -1, s: 0, why: 'Buns are a complement. When a complement costs more, people want fewer hot dogs at every price.' },
 { market: 'Used cars', text: 'New-car prices rise sharply.', d: 1, s: 0, why: 'New cars are a substitute for used ones, so more buyers turn to used cars at every price.' },
 { market: 'Bicycles', text: 'The city opens 20 miles of protected bike lanes.', d: 1, s: 0, why: 'Safer riding makes more people want bikes at every price.' },
 { market: 'Pizza', text: 'The price of cheese falls.', d: 0, s: 1, why: 'A cheaper input lowers the cost of each pizza, so shops offer more at every price.' },
 { market: 'Sneakers', text: 'A famous athlete is photographed wearing the brand’s new shoe.', d: 1, s: 0, why: 'A change in tastes: more people want the shoe at every price.' },
 { market: 'Avocados', text: 'Hundreds of orchards planted years ago start producing fruit.', d: 0, s: 1, why: 'More growers means more avocados offered at every price.' },
 { market: 'Store-brand instant noodles', text: 'A recession cuts incomes. Many shoppers buy more of these noodles when money is tight.', d: 1, s: 0, why: 'For this kind of good (an inferior good), lower incomes raise demand, because people switch to it from pricier food.' },
 { market: 'Electric scooters', text: 'The government starts paying scooter makers $50 for each scooter they produce.', d: 0, s: 1, why: 'A subsidy to sellers works like a lower cost per scooter, so supply rises.' },
 { market: 'Lumber', text: 'Wildfires force several sawmills to close.', d: 0, s: -1, why: 'Fewer sellers means less lumber offered at every price.' },
 { market: 'Apartments for rent', text: 'A large company opens an office in town and hires 5,000 people.', d: 1, s: 0, why: 'More people looking for apartments: more buyers in the market raises demand.' },
 { market: 'Video game consoles', text: 'Games for the console go on sale for half price.', d: 1, s: 0, why: 'Games are a complement to the console. When the complement gets cheaper, demand for the console rises.' },
 { market: 'Soda', text: 'A new tax is collected from sellers on every bottle of soda sold.', d: 0, s: -1, why: 'A tax on sellers works like a higher cost per bottle, so supply falls.' },
 { market: 'Wheat', text: 'Farmers find that corn now earns more per acre than wheat.', d: 0, s: -1, why: 'Sellers’ other options got better. Some farmers plant corn instead, so less wheat is offered at every wheat price.' }
];

export const traps: Headline[] = [
 { market: 'Concert tickets', text: 'Ticket prices rise, so fewer fans buy tickets.', d: 0, s: 0, why: 'Only the ticket price itself changed. Fans move along the demand curve to a smaller quantity demanded; the curve doesn’t shift.' },
 { market: 'Coffee', text: 'A café raises its latte price and sells fewer lattes.', d: 0, s: 0, why: 'The latte price is on the chart’s axis, so this is a slide along demand, not a shift.' },
 { market: 'Gasoline', text: 'Gas prices fall, and drivers buy more gas.', d: 0, s: 0, why: 'A lower price moves drivers along the demand curve to a larger quantity demanded.' },
 { market: 'Wheat', text: 'Wheat prices rise, so farmers grow more wheat.', d: 0, s: 0, why: 'A higher wheat price moves farmers along the supply curve to a larger quantity supplied.' }
];

export const doubles: Headline[] = [
 { market: 'Coffee', text: 'A drought shrinks the coffee harvest, and a viral study makes coffee more popular.', d: 1, s: -1, why: 'The drought shifts supply left; the study shifts demand right.' },
 { market: 'Smartphones', text: 'Chips get cheaper, and a must-have new app makes everyone want a new phone.', d: 1, s: 1, why: 'Cheaper chips shift supply right; the app shifts demand right.' },
 { market: 'Gasoline', text: 'A new refinery opens, and more people start working from home.', d: -1, s: 1, why: 'The refinery shifts supply right; working from home shifts demand left.' },
 { market: 'Ice cream', text: 'Cream prices rise, and the summer turns out cool and rainy.', d: -1, s: -1, why: 'Costlier cream shifts supply left; the cool summer shifts demand left.' },
 { market: 'Avocados', text: 'Growers bring in a record harvest, and a guacamole recipe goes viral.', d: 1, s: 1, why: 'The harvest shifts supply right; the recipe shifts demand right.' },
 { market: 'Apartments for rent', text: 'Several new apartment buildings open, and a large employer leaves town.', d: -1, s: 1, why: 'New buildings shift supply right; the employer leaving shifts demand left.' }
];

// Effect of the shifts on equilibrium price and quantity; null means it depends on the sizes.
export function effects(h: Headline): { p: Dir | null; q: Dir | null } {
 const pushP = ([h.d, -h.s] as Dir[]).filter(v => v !== 0), pushQ = [h.d, h.s].filter(v => v !== 0);
 const one = (v: Dir[]): Dir | null => v.length === 0 ? 0 : v.every(x => x === v[0]) ? v[0] : null;
 return { p: one(pushP), q: one(pushQ) };
}
