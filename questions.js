const ASSESSMENT_VERSION='2026-09-08-v6';
const QUESTIONS = [
  {
    "id": "Q1",
    "dimension": 0,
    "title": "Who is accountable for evaluating AI in your business?",
    "options": [
      "Responsibility has not been assigned.",
      "Interested people are exploring, without a shared owner.",
      "A sponsor is named; authority or working time is still unclear.",
      "An accountable owner has the authority and time to evaluate where AI belongs."
    ]
  },
  {
    "id": "Q2",
    "dimension": 0,
    "title": "How would you know an AI initiative was worth pursuing?",
    "options": [
      "We have not defined what improvement would mean.",
      "We have a goal, but no baseline or way to assess it.",
      "We have a baseline and measures; review criteria need work.",
      "We have measures, a review point, and criteria to continue, change, or stop."
    ]
  },
  {
    "id": "Q3",
    "dimension": 0,
    "title": "How clearly have you mapped the work you want to improve?",
    "options": [
      "We have not identified the work yet.",
      "We know a problem area, but have not traced the workflow.",
      "We understand the workflow; dependencies or impacts on people remain unclear.",
      "We understand the workflow, its dependencies, and what should remain in human hands."
    ]
  },
  {
    "id": "Q4",
    "dimension": 1,
    "title": "For a priority business question, how usable is the underlying data?",
    "options": [
      "We do not yet know which sources are needed.",
      "We know the sources, but quality or ownership is unclear.",
      "Most sources are usable; specific gaps need attention.",
      "The relevant sources have owners, agreed definitions, and quality checks."
    ]
  },
  {
    "id": "Q5",
    "dimension": 1,
    "title": "Can authorized people bring information together across teams?",
    "options": [
      "They usually have to start a new search or request.",
      "They can assemble it, but delays and manual work are common.",
      "Key views are available, with some gaps or access friction.",
      "The information arrives in time for the task, with appropriate access controls."
    ]
  },
  {
    "id": "Q6",
    "dimension": 1,
    "title": "Can people find and reuse the knowledge the business should keep?",
    "options": [
      "Useful knowledge is often hard to find or leaves with individuals.",
      "Some is documented, but finding a current answer is difficult.",
      "Key knowledge is searchable; ownership or review needs attention.",
      "Useful knowledge is maintained and searchable, with clear access and retention rules."
    ]
  },
  {
    "id": "Q7",
    "dimension": 2,
    "title": "How well does your network support the work you plan to run?",
    "options": [
      "We have not reviewed its requirements or current problems.",
      "We know there are bottlenecks, but not their cause or impact.",
      "We have mapped the needs; performance or recovery still needs testing.",
      "We have checked performance, connectivity, and recovery against the intended workload."
    ]
  },
  {
    "id": "Q8",
    "dimension": 2,
    "title": "Can you add the capacity you need at a cost you understand?",
    "options": [
      "We have not assessed capacity or cost.",
      "We can add resources, but timing or ongoing costs are uncertain.",
      "We have a capacity plan; some cost or support assumptions need testing.",
      "We have a workable plan for capacity, total cost, support, and changing demand."
    ]
  },
  {
    "id": "Q9",
    "dimension": 2,
    "title": "How do you choose where a workload runs?",
    "options": [
      "We have not considered placement.",
      "We generally accept the default without reviewing the implications.",
      "We compare options, but some data, cost, or operating needs remain unclear.",
      "We compare placement against data requirements, performance, cost, and our ability to operate it."
    ]
  },
  {
    "id": "Q10",
    "dimension": 3,
    "title": "How well do you understand which AI tools are being used?",
    "options": [
      "We have little visibility into use.",
      "We know approved tools, with limited visibility beyond them.",
      "We review actual use, but ownership or coverage has gaps.",
      "We maintain an inventory, monitor use, and have a process to address gaps."
    ]
  },
  {
    "id": "Q11",
    "dimension": 3,
    "title": "How clear are the rules for sharing business information with AI?",
    "options": [
      "We have not defined the boundaries.",
      "We have guidance, but people lack a supported way to follow it.",
      "Approved uses and safeguards exist; some coverage needs work.",
      "People have clear rules, approved tools, tested safeguards, and an exception process."
    ]
  },
  {
    "id": "Q12",
    "dimension": 3,
    "title": "How are AI outputs and actions checked?",
    "options": [
      "Review is not defined.",
      "Individuals decide when something needs checking.",
      "Some workflows have checks, but ownership or escalation is unclear.",
      "Review matches the risk, consequential actions have approval points, and errors have an owner."
    ]
  },
  {
    "id": "Q13",
    "dimension": 4,
    "title": "How well do tools fit the people using them?",
    "options": [
      "People must improvise, re-enter information, or switch tools repeatedly.",
      "Useful tools exist, but the handoffs create substantial extra work.",
      "Most key tasks are supported; a few repeated points of friction remain.",
      "Tools support key tasks, with clear access, usable handoffs, and feedback from the people doing the work."
    ]
  },
  {
    "id": "Q14",
    "dimension": 4,
    "title": "When a customer or colleague moves between teams, what follows them?",
    "options": [
      "They usually have to explain the situation again.",
      "Some history exists, but the next team has to hunt for it.",
      "Most relevant context follows them, with some gaps.",
      "The next team gets the relevant, permitted context and a clear next step."
    ]
  },
  {
    "id": "Q15",
    "dimension": 4,
    "title": "What happens to agreed actions after a meeting?",
    "options": [
      "Actions often stay in individual notes or get lost.",
      "Someone records them, but ownership or follow-up is inconsistent.",
      "Actions have owners; tracking or access sometimes breaks down.",
      "People can find the agreed actions, responsible owners, and follow-up status."
    ]
  },
  {
    "id": "Q16",
    "dimension": 5,
    "title": "What support do people have to learn a new way of working?",
    "options": [
      "Little time or support is available.",
      "Tools or guidance are available, but learning is mostly on their own.",
      "Some role-specific practice exists; ongoing support is limited.",
      "People have relevant practice, time, support, and a way to raise concerns."
    ]
  },
  {
    "id": "Q17",
    "dimension": 5,
    "title": "When a team finds a useful practice, what happens next?",
    "options": [
      "It usually stays with the person who found it.",
      "Others may hear about it, but there is no reliable way to find it.",
      "Useful practices are shared; validation or maintenance is inconsistent.",
      "Practices are checked, documented, and shared where relevant, with an owner to keep them useful."
    ]
  },
  {
    "id": "Q18",
    "dimension": 5,
    "title": "How do leaders support the change they are asking people to make?",
    "options": [
      "Expectations are unclear or mostly absent.",
      "Leaders encourage adoption, but leave teams to work out the impact.",
      "Leaders sponsor the work; time, feedback, or accountability needs attention.",
      "Leaders set expectations, make time to learn, listen to concerns, and review the effects on the work."
    ]
  }
];
