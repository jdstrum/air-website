const SCENARIOS={
 finance:{question:'What explains the difference between planned and actual spend?',sources:[['BUDGET','The spending plan.'],['ACTUALS','The recorded transactions.'],['OPERATING CONTEXT','The activity behind the spend.']],states:[
 ['Start with a source.','Choose the information available to the business. Each source adds context to the question.'],
 ['A plan to compare against.','The budget sets the expectation. Recorded transactions and operating context are needed to investigate what actually happened.'],
 ['Spending, without the comparison.','The transactions show recorded spending. Check completeness and classification, then connect the plan and operating activity to understand the difference.'],
 ['A variance to investigate.','Budget and actuals show where spending differs from the plan. Check that periods and categories align; operating context can help explain the cause.'],
 ['Activity, without the financial picture.','Volume, staffing, or delivery changes may matter. Connect them to the plan and recorded spending before drawing a financial conclusion.'],
 ['A changed business against a plan.','The plan and operating activity help identify which assumptions may have shifted. Actual transactions are still needed to assess the spending difference.'],
 ['Spending with operating context.','Transactions and business activity can help investigate what drove spending. The budget adds the intended baseline for comparison.'],
 ['A difference you can investigate with context.','Compare aligned budget and actual figures alongside the activity behind them. Trace the source, check timing and classification, and have the responsible team validate the explanation.']
 ]},
 operations:{question:'What could put the next delivery at risk?',sources:[['DEMAND','What has been promised.'],['CAPACITY','What the team can deliver.'],['SUPPLY','What is arriving—and when.']],states:[
 ['Start with a source.','Choose the information available to the business. Each source adds context to the question.'],
 ['A commitment to prepare for.','Orders and due dates tell you what is expected. Capacity and supply information are needed to understand whether the promise can be met.'],
 ['Capacity, without the full demand.','You can see available people, equipment, or production time. Committed work and supply dependencies are needed to assess the pressure on them.'],
 ['A capacity constraint to examine.','Demand and capacity show where commitments may exceed available time. Supply information adds the dependencies that could change the plan.'],
 ['An arrival schedule to check.','Supplier dates show when inputs are expected. Demand and capacity determine which changes matter to delivery.'],
 ['A commitment with a supply dependency.','Demand and supply can expose an input arriving too late. Check capacity to see what can realistically be rescheduled.'],
 ['Resources, without the priorities.','Capacity and supply show what may be available. Committed demand adds the timing and priorities needed to plan the work.'],
 ['A delivery risk with a clearer next move.','Compare commitments with available capacity and expected inputs. Confirm current dates, identify the constraint, and have the operating owner review a workable response.']
 ]},
 customers:{question:'Who needs attention before renewal?',sources:[['CUSTOMER RECORD','The renewal is next month.'],['SERVICE HISTORY','An issue is still unresolved.'],['CONTRACT','A service commitment matters.']],states:[
 ['Start with a source.','Choose the information available to the business. Each source adds context to the question.'],
 ['A renewal to prepare for.','The customer record tells you when to reach out. It does not tell you what that conversation needs to address.'],
 ['An unresolved service issue.','You can see the problem. Customer and contract context would help determine how to prioritize and address it.'],
 ['A renewal with something to resolve.','Timing and service history suggest a conversation that starts with the open issue. The contract can add the obligations that need to shape the response.'],
 ['A promise, without the current picture.','The agreement explains the commitment. Customer and service records are needed to connect it to what is happening now.'],
 ['A renewal with a commitment to review.','You have the timing and the agreement. Service history is still needed to understand whether the customer’s current experience matches that commitment.'],
 ['An issue with an obligation behind it.','The service record and contract help frame what needs attention. The customer record adds the renewal timing and relationship context.'],
 ['Resolve the issue before the renewal conversation.','The renewal date, open issue, and service commitment now sit together. Verify the obligation, identify an owner, and prepare a conversation that addresses the customer’s situation.']
 ]}
};
let scenarioName='finance';const selectedSources=new Set([0]);
const sourceButtons=document.querySelectorAll('[data-source]'),scenarioButtons=document.querySelectorAll('[data-scenario]');
function updateContext(){
 const scenario=SCENARIOS[scenarioName];let mask=0;selectedSources.forEach(i=>mask|=1<<i);const [title,copy]=scenario.states[mask];
 document.querySelector('#scenario-question').textContent=scenario.question;
 document.querySelector('#context-title').textContent=title;document.querySelector('#context-copy').textContent=copy;document.querySelector('#context-count').textContent=selectedSources.size+' of 3 sources connected';
 document.querySelector('.context-readout').classList.toggle('complete',selectedSources.size===3);
 sourceButtons.forEach((b,i)=>{const on=selectedSources.has(i);b.setAttribute('aria-pressed',String(on));b.querySelector('.source-kind').textContent=scenario.sources[i][0];b.querySelector('strong').textContent=scenario.sources[i][1];b.querySelector('.source-action').innerHTML=(on?'Included':'Add context')+' <i aria-hidden="true">'+(on?'−':'+')+'</i>'});
 scenarioButtons.forEach(b=>b.setAttribute('aria-pressed',String(b.dataset.scenario===scenarioName)));
}
sourceButtons.forEach(b=>b.addEventListener('click',()=>{const i=Number(b.dataset.source);selectedSources.has(i)?selectedSources.delete(i):selectedSources.add(i);updateContext()}));
scenarioButtons.forEach(b=>b.addEventListener('click',()=>{scenarioName=b.dataset.scenario;selectedSources.clear();selectedSources.add(0);updateContext()}));
updateContext();
