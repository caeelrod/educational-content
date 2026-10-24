// All of the lesson's reading passages and practice items.
// Ridgeview Middle School is made up, and so are its numbers, people, and surveys.
// The one real-world fact (the American Academy of Pediatrics start-time recommendation)
// is cited in the teacher guide.

export type Part = 'claim' | 'evidence' | 'reasoning' | 'counterclaim' | 'rebuttal';

export const partInfo: Record<Part, { name: string; short: string; job: string }> = {
 claim: { name: 'Claim', short: 'C', job: 'What the writer wants you to believe or do.' },
 evidence: { name: 'Evidence', short: 'E', job: 'Facts, numbers, examples, or quotes that back up the claim.' },
 reasoning: { name: 'Reasoning', short: 'R', job: 'Explains how the evidence proves the claim. The bridge between them.' },
 counterclaim: { name: 'Counterclaim', short: 'CC', job: 'What someone who disagrees would say.' },
 rebuttal: { name: 'Rebuttal', short: 'RB', job: 'The writer’s answer to the counterclaim.' }
};
export const partOrder: Part[] = ['claim', 'evidence', 'reasoning', 'counterclaim', 'rebuttal'];

// ---------- 1. Spot the parts ----------
export type Sentence = { text: string; part: Part; why: string };
export type Passage = { title: string; sentences: Sentence[] };

export const passages: Passage[] = [
 { title: 'Let us sleep', sentences: [
  { part: 'claim', text: 'Ridgeview Middle School should move its start time from 7:45 to 8:30 a.m.',
   why: 'This is the main point the whole paragraph is trying to get you to agree with.' },
  { part: 'evidence', text: 'In 2014, the American Academy of Pediatrics, a large group of children’s doctors, recommended that middle and high schools start at 8:30 a.m. or later.',
   why: 'It’s a fact from a trusted source, an expert group of doctors. It doesn’t explain anything yet; it just backs up the claim.' },
  { part: 'evidence', text: 'In a survey of 300 Ridgeview students, 6 out of 10 said they feel sleepy during first period.',
   why: 'A number from a survey of the very students the claim is about. That’s evidence.' },
  { part: 'reasoning', text: 'Students who are fighting to stay awake can’t focus on what they’re learning, and doctors are saying the early bell is part of the problem, so a later start would let students get the sleep they need to learn.',
   why: 'This sentence connects the dots. It explains why sleepy students and the doctors’ advice mean the start time should change.' },
  { part: 'counterclaim', text: 'Some parents worry that a later start would push sports practices and after-school jobs later into the evening.',
   why: 'Words like “some parents worry” signal the other side’s view. A fair counterclaim states a real concern.' },
  { part: 'rebuttal', text: 'However, practices would move only 45 minutes later, and well-rested students are better prepared for both class and the game.',
   why: '“However” answers the counterclaim and gives a reason it isn’t a deal-breaker.' }
 ] },
 { title: 'Lockers at lunch', sentences: [
  { part: 'claim', text: 'Ridgeview should keep its rule that phones stay in lockers during lunch.',
   why: 'This is the position the writer is arguing for. Everything else supports it or answers the other side.' },
  { part: 'evidence', text: 'The year before the rule, the front office handled 40 reports of mean posts that started at lunch; this year it handled 12.',
   why: 'Before-and-after numbers from the school’s own records. That’s evidence.' },
  { part: 'counterclaim', text: 'Some students argue that they need their phones at lunch to reach their parents.',
   why: '“Some students argue” introduces the other side. This counterclaim comes in the middle, which is fine.' },
  { part: 'rebuttal', text: 'But students can still check their phones before and after school, and the front office can reach any parent in an emergency.',
   why: '“But” starts the answer to the counterclaim, with two reasons the concern is covered.' },
  { part: 'evidence', text: 'Cafeteria monitors also say more students now talk with people outside their usual group.',
   why: 'Another observation from people who were there. It supports the claim, so it’s evidence.' },
  { part: 'reasoning', text: 'When phones are put away, students talk face to face instead of posting, so there are fewer chances for a photo or comment to turn into a fight.',
   why: 'This explains how the rule caused the drop in mean posts. It’s the “because” that links the numbers to the claim.' }
 ] },
 { title: 'Dig in', sentences: [
  { part: 'counterclaim', text: 'Some people say the empty lot behind the gym should stay empty because a garden would cost too much.',
   why: 'The paragraph opens with the other side’s view. Writers sometimes start this way to answer it right away.' },
  { part: 'rebuttal', text: 'But the parent group has already offered $1,200 for seeds, soil, and tools, so the school would not have to pay.',
   why: 'This answers the cost worry with a specific fact.' },
  { part: 'claim', text: 'Ridgeview should turn the empty lot into a student garden.',
   why: 'Here is the writer’s actual position. A claim doesn’t have to be the first sentence.' },
  { part: 'evidence', text: 'When Mr. Okafor’s science classes grew beans in cups last spring, 85 of his 90 students said they wanted to grow more.',
   why: 'A specific result from a real class project at the school. That’s evidence.' },
  { part: 'reasoning', text: 'If almost every student wanted to keep growing plants after one small project, a real garden would give them a reason to come to science excited and use what they learn.',
   why: 'This explains what the bean results mean for the garden idea. It turns the number into a reason.' },
  { part: 'claim', text: 'For students who are ready to dig in, the empty lot is the perfect place to start.',
   why: 'The closing sentence restates the claim in new words. Many arguments end by coming back to the claim.' }
 ] }
];

// ---------- 2. Sharpen the claim ----------
export type Kind = 'arguable' | 'fact' | 'taste' | 'vague';
export const kindInfo: Record<Kind, { name: string; hint: string }> = {
 arguable: { name: 'Arguable claim', hint: 'Someone could reasonably disagree, and evidence could help settle it.' },
 fact: { name: 'Just a fact', hint: 'You can look it up or check it. There’s nothing to argue.' },
 taste: { name: 'Personal taste', hint: 'It depends on what someone likes. Evidence can’t change it.' },
 vague: { name: 'Too vague', hint: 'It isn’t clear what exactly should change or who should do it.' }
};
export type Statement = { text: string; kind: Kind; why: string };
export const statements: Statement[] = [
 { kind: 'arguable', text: 'Ridgeview should add a 20-minute recess for seventh graders.', why: 'It says who should do what, and people could disagree (it takes time from classes). Evidence about focus or schedules could help decide.' },
 { kind: 'fact', text: 'The Ridgeview cafeteria serves lunch from 11:00 to 12:30.', why: 'You could check the schedule. Once you do, there’s nothing left to argue.' },
 { kind: 'taste', text: 'Blue is the best color.', why: 'Favorite colors are about taste. No amount of evidence will change someone’s favorite.' },
 { kind: 'vague', text: 'School should be better.', why: 'Better how? A strong claim names a specific change, like a longer lunch or a new club.' },
 { kind: 'arguable', text: 'Students should be allowed to retake one test each grading period.', why: 'Clear and specific, and reasonable people disagree. Evidence about learning could help settle it.' },
 { kind: 'fact', text: 'At sea level, water boils at 100 °C.', why: 'This is a measured fact. Scientists have already checked it.' },
 { kind: 'vague', text: 'Video games are bad.', why: 'Bad for whom, and in what way? Sharpen it: “Students our age should limit video games to two hours on school nights.”' },
 { kind: 'taste', text: 'Summer is more fun than winter.', why: 'Some people love snow and some love the beach. That’s preference, not an argument.' },
 { kind: 'arguable', text: 'Our town should build a skate park next to the public library.', why: 'Specific (what and where), and people could disagree about cost, noise, or safety.' },
 { kind: 'fact', text: 'Some Ridgeview students have homework every night.', why: 'You could find out by asking. It’s a fact, though it could be evidence for a claim about homework.' },
 { kind: 'vague', text: 'Things need to change around here.', why: 'What things? Change how? The reader can’t agree or disagree until they know.' },
 { kind: 'taste', text: 'Pepperoni pizza tastes better than cheese pizza.', why: 'Taste buds win this one. Evidence can’t settle what tastes better to you.' }
];

export type Fix = { weak: string; options: { text: string; best?: boolean; why: string }[] };
export const fixes: Fix[] = [
 { weak: 'Phones are bad.', options: [
  { text: 'Phones are really, really bad.', why: 'Adding “really” makes it louder, not clearer. It still doesn’t say what should change.' },
  { text: 'Ridgeview should require phones to stay in lockers during class.', best: true, why: 'Now it names who (Ridgeview), what (lockers), and when (during class). Someone could disagree, and evidence could help decide.' },
  { text: 'I don’t like phones.', why: 'That’s a personal feeling. Readers can’t argue with what you like.' }
 ] },
 { weak: 'Lunch stinks.', options: [
  { text: 'Lunch at Ridgeview is 25 minutes long.', why: 'That’s a fact you could check, not a claim. It might be evidence, though!' },
  { text: 'Lunch is the worst part of the day.', why: 'Still a feeling. What should be done about it?' },
  { text: 'Ridgeview should lengthen lunch from 25 to 35 minutes.', best: true, why: 'Specific and arguable: it names the change, and people could disagree about what it would cost the schedule.' }
 ] },
 { weak: 'Sports are good.', options: [
  { text: 'Ridgeview should offer a free after-school sports club for students who aren’t on a team.', best: true, why: 'A clear proposal. You could gather evidence about cost, interest, and benefits.' },
  { text: 'Everyone loves sports.', why: 'That’s not true of everyone, and it doesn’t say what should happen.' },
  { text: 'Soccer is the best sport.', why: 'That’s a matter of taste. Fans of other sports will never be convinced by evidence.' }
 ] }
];

// ---------- 3. Back it up ----------
export type Strength = 'strong' | 'weak';
export type Card = { text: string; strength: Strength; tag: string; why: string };
export type Choice = { text: string; best?: boolean; why: string };
export type Support = { claim: string; cards: Card[]; reasons: Choice[] };

export const supports: Support[] = [
 { claim: 'Ridgeview should lengthen lunch from 25 to 35 minutes.', cards: [
  { strength: 'strong', tag: 'Measured fact', text: 'A count by the cafeteria staff found the average student waits 11 minutes in line, leaving about 14 minutes to eat.',
   why: 'Specific, measured at this school, and directly about the time students have to eat.' },
  { strength: 'weak', tag: 'Bandwagon', text: 'Everyone knows lunch is too short.',
   why: '“Everyone knows” isn’t evidence. It’s the bandwagon trick: claiming lots of people agree instead of showing proof.' },
  { strength: 'weak', tag: 'One story', text: 'My friend Jayden said he was hungry once in fifth period.',
   why: 'One person, one time. A single story can make a point feel real, but it can’t show that lunch is too short for most students.' },
  { strength: 'strong', tag: 'Survey', text: 'In a student survey, 7 out of 10 students who threw away food said they ran out of time to finish it.',
   why: 'A survey of many students that connects wasted food to time. Relevant and specific.' },
  { strength: 'weak', tag: 'Off topic', text: 'The cafeteria’s new tables are made of recycled plastic.',
   why: 'It’s true and about the cafeteria, but it has nothing to do with how long lunch is.' },
  { strength: 'weak', tag: 'Opinion', text: 'Lunch at Ridgeview is boring.',
   why: 'That’s an opinion, and it argues for a different change (more fun), not more time.' }
 ], reasons: [
  { text: 'The average student waits 11 minutes in line.', why: 'This only repeats the evidence. Reasoning has to explain what the evidence means for the claim.' },
  { text: 'Lunch should be longer because lunch should be longer.', why: 'That’s circular: it uses the claim to prove itself.' },
  { text: 'With only about 14 minutes to eat, many students run out of time and throw food away, so 10 more minutes would let them finish their lunch and not be hungry in afternoon classes.', best: true,
   why: 'It connects both pieces of evidence (14 minutes, thrown-away food) to why the extra 10 minutes would help.' },
  { text: 'A longer lunch would be fun, and fun is important.', why: 'This jumps to a new idea (fun) instead of explaining the evidence about time and food.' }
 ] },
 { claim: 'Ridgeview should keep its library open until 5 p.m. on school days.', cards: [
  { strength: 'strong', tag: 'Expert witness', text: 'Ms. Rivera, the librarian, says 25 to 30 students are still waiting to use the computers when she locks up at 3:45.',
   why: 'The person who sees it every day, with a specific number. Relevant and believable.' },
  { strength: 'weak', tag: 'Biased source', text: 'A company that sells library furniture says libraries are “the heart of every school.”',
   why: 'The source makes money if schools spend more on libraries, and the quote is vague. Always ask: who is saying this, and why?' },
  { strength: 'strong', tag: 'Fact about access', text: 'The public library is 3 miles away, and the city bus that goes there runs once an hour.',
   why: 'Shows that students don’t have another easy place to go. That makes the need real.' },
  { strength: 'weak', tag: 'Off topic', text: 'Libraries have existed for thousands of years.',
   why: 'Interesting, but it says nothing about Ridgeview’s hours.' },
  { strength: 'weak', tag: 'Opinion', text: 'I think the library is really cool.',
   why: 'A personal feeling. It doesn’t show anyone needs it open later.' },
  { strength: 'strong', tag: 'Petition', text: 'Last year, 140 students signed a petition asking for later library hours.',
   why: 'Shows how many students want the change, and it’s a number anyone could check.' }
 ], reasons: [
  { text: 'Libraries are the heart of every school, so ours should stay open.', why: 'This leans on the weakest card, the furniture company’s slogan.' },
  { text: 'Many students have nowhere nearby to study after 3:45, since the public library is hard to reach by bus, and the students still waiting at closing show the need is real. Longer hours would give them a place to finish their work.', best: true,
   why: 'It explains why the bus facts and the librarian’s count together mean the library should stay open.' },
  { text: '140 students signed a petition.', why: 'That just repeats one piece of evidence without explaining it.' },
  { text: 'The library should be open later because later is better.', why: 'Circular. It doesn’t give a reason anyone could check.' }
 ] },
 { claim: 'Every Ridgeview classroom should have a recycling bin.', cards: [
  { strength: 'weak', tag: 'Celebrity', text: 'A famous singer posted that recycling is “so important.”',
   why: 'Being famous doesn’t make someone an expert, and the post doesn’t give any facts.' },
  { strength: 'strong', tag: 'Measured fact', text: 'A one-week count by the school’s Green Team found that about 6 out of every 10 pounds of classroom trash was paper.',
   why: 'Measured at this school, and it shows there’s a lot to recycle.' },
  { strength: 'weak', tag: 'No support', text: 'Recycling is good for the planet, obviously.',
   why: '“Obviously” skips the proof. Many people agree, but this gives no facts about Ridgeview.' },
  { strength: 'strong', tag: 'Fact about cost', text: 'The district already picks up recycling bins for free at the high school next door.',
   why: 'Answers the question “could we actually do this?” with a fact about cost.' },
  { strength: 'weak', tag: 'Off topic', text: 'Ridgeview’s school colors are green and gold.',
   why: 'Green is a color here, not the environment. Nothing to do with recycling.' }
 ], reasons: [
  { text: 'About 6 out of every 10 pounds of classroom trash is paper.', why: 'This restates the evidence. What does it mean for the claim?' },
  { text: 'Everyone should care about the planet more.', why: 'A big general idea that doesn’t explain the evidence at all.' },
  { text: 'Recycling is so important, so we should do it.', why: 'This uses the celebrity post, which isn’t real evidence.' },
  { text: 'If most classroom trash is paper and the district will pick up bins for free, then a bin in each room would keep most of that trash out of the landfill without costing the school money.', best: true,
   why: 'Uses “if… then” to connect both strong cards to the claim.' }
 ] }
];

// ---------- 4. Answer the other side ----------
export type Debate = { claim: string; counters: Choice[]; rebuttals: Choice[] };
export const debates: Debate[] = [
 { claim: 'Ridgeview should start school at 8:30 a.m. instead of 7:45.',
  counters: [
   { text: 'People who want a later start are just lazy.', why: 'That’s a straw man: a weak, unfair version of the other side that’s easy to knock down. Readers who disagree won’t recognize their own view.' },
   { text: 'A later start could push sports practices and after-school jobs later into the evening.', best: true, why: 'A real concern a thoughtful person might have. Answering it shows readers you’ve thought it through.' },
   { text: 'Some schools have blue buses.', why: 'Not an argument against the claim at all, so answering it proves nothing.' }
  ], rebuttals: [
   { text: 'That’s just wrong.', why: 'Saying it’s wrong isn’t the same as showing it’s wrong. Give a reason.' },
   { text: 'That’s a fair worry, but practices would move only 45 minutes later, and rested students focus better in class and at practice.', best: true, why: 'It admits the concern is real, then answers it with specifics. That’s the strongest kind of rebuttal.' },
   { text: 'People who worry about practice don’t care about kids.', why: 'That attacks the people instead of answering their point. It’s called an attack on the person, and it makes readers trust you less.' },
   { text: 'That’s true, so let’s forget the whole idea.', why: 'This gives up the argument. A rebuttal can admit part of a point while still explaining why the claim holds.' }
  ] },
 { claim: 'Phones should stay in lockers during lunch.',
  counters: [
   { text: 'Phones were invented a long time ago.', why: 'That has nothing to do with whether they belong at lunch.' },
   { text: 'People against this rule want everyone staring at screens all day.', why: 'A straw man. Most people against the rule just want a few minutes to check messages.' },
   { text: 'Students may need their phones to contact parents about rides or emergencies.', best: true, why: 'This is the strongest worry the other side actually has. Taking it on makes your argument more convincing.' }
  ], rebuttals: [
   { text: 'Anyone who says that is just addicted to their phone.', why: 'An attack on the person. It doesn’t answer the worry about reaching parents.' },
   { text: 'Rules are rules.', why: 'That doesn’t explain why this rule is a good one.' },
   { text: 'Yeah, phones are important, so whatever.', why: 'This gives up instead of answering.' },
   { text: 'Students can still check their phones before and after school, and the front office can reach any parent during an emergency.', best: true, why: 'It answers the exact worry with two specific facts.' }
  ] },
 { claim: 'Ridgeview should turn the empty lot into a student garden.',
  counters: [
   { text: 'Someone would have to water and weed the garden over the summer, when school is closed.', best: true, why: 'A practical problem people would really raise. If you can solve it, your argument gets stronger.' },
   { text: 'Garden fans think vegetables can fix everything.', why: 'A straw man that makes the other side sound silly instead of stating a real concern.' },
   { text: 'The gym was painted last year.', why: 'True, maybe, but not a reason against the garden.' }
  ], rebuttals: [
   { text: 'The garden will be fine, trust me.', why: '“Trust me” isn’t a reason. Show how the problem would be solved.' },
   { text: 'Only lazy people would complain about watering.', why: 'An attack on the person. It ignores the actual problem.' },
   { text: 'That’s a real problem, but the garden club could set up a summer watering schedule with families, and students could plant crops that are ready to pick before school ends.', best: true, why: 'It admits the problem and offers two specific solutions.' },
   { text: 'You’re right, it’s too hard.', why: 'This hands the argument to the other side.' }
  ] }
];

// ---------- 5. Build your own ----------
export type BankCard = { text: string; side: 'yes' | 'no' | 'weak'; why: string };
export type Topic = { id: string; question: string; yes: string; no: string; bank: BankCard[]; counterYes: string; counterNo: string };

// counterYes is what someone who disagrees with the "yes" side would say, and counterNo the reverse.
export const topics: Topic[] = [
 { id: 'start', question: 'Should Ridgeview start school at 8:30 a.m. instead of 7:45?',
  yes: 'Ridgeview should start school at 8:30 a.m. instead of 7:45.',
  no: 'Ridgeview should keep its 7:45 a.m. start time.',
  counterYes: 'Some families worry that a later start would push practices, jobs, and the end of the day later into the evening.',
  counterNo: 'Some people argue that many students are too sleepy to learn well at 7:45 in the morning.',
  bank: [
   { side: 'yes', text: 'In 2014, the American Academy of Pediatrics recommended that middle and high schools start at 8:30 a.m. or later.', why: 'An expert group of children’s doctors. Strong support for a later start.' },
   { side: 'yes', text: 'In a survey of 300 Ridgeview students, 6 out of 10 said they feel sleepy during first period.', why: 'A survey of the students the claim is about.' },
   { side: 'no', text: 'The district says changing bus routes for a later start would cost about $90,000 a year.', why: 'A cost the school would have to pay. Strong support for keeping the current time.' },
   { side: 'no', text: 'In a parent survey, about 1 in 4 families said an older child watches younger siblings after school, and a later end time would make that harder.', why: 'Shows a real effect on many families.' },
   { side: 'weak', text: 'Everybody hates mornings.', why: 'Bandwagon. Not everybody does, and it isn’t proof of anything.' },
   { side: 'weak', text: 'My cousin’s school starts at 9:00, and he says it’s great.', why: 'One person’s story about a different school.' }
  ] },
 { id: 'phones', question: 'Should Ridgeview students be allowed to use phones at lunch?',
  yes: 'Ridgeview students should be allowed to use their phones during lunch.',
  no: 'Ridgeview should keep its rule that phones stay in lockers during lunch.',
  counterYes: 'Some people argue that phones at lunch lead to more mean posts and less talking face to face.',
  counterNo: 'Some students argue that they need their phones at lunch to keep in touch with their families.',
  bank: [
   { side: 'yes', text: 'In a student council survey, 7 out of 10 students said lunch is when they check messages from family about rides and schedules.', why: 'Shows a practical reason students want phones at lunch.' },
   { side: 'yes', text: 'Students in the coding club use lunch to test apps they are building on their phones.', why: 'A specific, school-related use of phones at lunch.' },
   { side: 'no', text: 'The year before the locker rule, the front office handled 40 reports of mean posts that started at lunch; this year it handled 12.', why: 'Before-and-after numbers from school records.' },
   { side: 'no', text: 'Cafeteria monitors say more students now talk with people outside their usual group.', why: 'Observations from adults who see lunch every day.' },
   { side: 'weak', text: 'Phones are the future.', why: 'A slogan, not evidence. It doesn’t say anything about lunch.' },
   { side: 'weak', text: 'An ad from a phone company says kids need their phones every minute.', why: 'A biased source: the company wants to sell phones.' }
  ] },
 { id: 'lunch', question: 'Should Ridgeview make lunch 10 minutes longer?',
  yes: 'Ridgeview should lengthen lunch from 25 to 35 minutes.',
  no: 'Ridgeview should keep lunch at 25 minutes.',
  counterYes: 'Some teachers argue that a longer lunch would take time away from classes or make the school day longer.',
  counterNo: 'Some students argue that 25 minutes isn’t enough time to get through the line and finish eating.',
  bank: [
   { side: 'yes', text: 'A count by the cafeteria staff found the average student waits 11 minutes in line, leaving about 14 minutes to eat.', why: 'Measured at this school, and directly about time to eat.' },
   { side: 'yes', text: 'In a student survey, 7 out of 10 students who threw away food said they ran out of time to finish it.', why: 'Connects wasted food to the length of lunch.' },
   { side: 'no', text: 'Adding 10 minutes to lunch would mean either ending the school day 10 minutes later or cutting 2 minutes from each of five classes.', why: 'Shows the real cost of the change to the schedule.' },
   { side: 'no', text: 'The cafeteria manager says opening a second serving line would cut the wait about in half without changing the schedule.', why: 'Offers another way to fix the problem. Strong support for keeping lunch the same length.' },
   { side: 'weak', text: 'Lunch is the best part of the day.', why: 'An opinion. It doesn’t show lunch is too short.' },
   { side: 'weak', text: 'Everyone knows teachers want lunch to be shorter.', why: 'Bandwagon, and it isn’t backed up by anything.' }
  ] }
];

// Sentence starters students can drop into their writing. `insert` is what gets typed into the box.
export type Starter = { label: string; insert: string };
export const reasonStarters: Starter[] = [
 { label: 'This shows that…', insert: 'This shows that ' },
 { label: 'This matters because…', insert: 'This matters because ' },
 { label: 'If…, then…', insert: 'If ' },
 { label: 'Because of this,…', insert: 'Because of this, ' }
];
export const rebuttalStarters: Starter[] = [
 { label: 'That’s a fair point, but…', insert: 'That’s a fair point, but ' },
 { label: 'However,…', insert: 'However, ' },
 { label: 'Even so,…', insert: 'Even so, ' },
 { label: 'While that may be true,…', insert: 'While that may be true, ' }
];
