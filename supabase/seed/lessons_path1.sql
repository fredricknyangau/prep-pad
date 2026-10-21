-- =============================================================================
-- lessons_path1.sql
-- AZ-900 Prep Coach — Seed for Path 1: Describe cloud concepts
-- Total lessons: 13
-- Idempotent insert with ON CONFLICT (slug) DO UPDATE.
-- reviewed_by_human is preserved and NOT touched on update.
-- =============================================================================

insert into public.lessons (
    slug,
    topic_id,
    position,
    title,
    summary,
    key_terms,
    real_example,
    exam_lens,
    common_distractor,
    memory_hook,
    check_yourself,
    source_url,
    est_read_minutes,
    needs_verification,
    verify_note,
    reviewed_by_human
)
values (
    $lsn$p1-m1-02-introduction-to-cloud-computing$lsn$,
    (
        select m.id
        from public.topics m
        join public.topics d on m.parent_id = d.id
        where d.title = $lsn$Describe cloud concepts$lsn$
          and m.title = $lsn$Describe cloud computing$lsn$
    ),
    1,
    $lsn$Introduction to cloud computing$lsn$,
    $lsn$This module establishes the cloud fundamentals needed to reason about how computing resources are acquired and operated. Its learning objectives cover the definition of cloud computing, shared responsibility, deployment models and consumption-based pricing. These ideas are linked: the deployment model describes where and how resources are arranged, while the service model affects which party operates each layer. The module is foundational, so it is worth being able to explain each term without relying on a memorized slogan.$lsn$,
    $lsn$[{"term":"Cloud computing","definition":"Delivery of computing capabilities over a network, commonly the internet."},{"term":"Deployment model","definition":"How cloud resources are organized and made available, such as public, private or hybrid cloud."},{"term":"Consumption-based model","definition":"Paying for cloud resources according to usage rather than buying all capacity upfront."}]$lsn$::jsonb,
    $lsn$A Kenyan fintech can run its API on Azure App Service and store transactions in Azure Database for PostgreSQL, expanding capacity as transaction volume grows. Its engineers still need to know which operational tasks Azure handles and which remain their responsibility.$lsn$,
    $lsn$Expect scenario-based distinction between shared responsibility, cloud deployment models and pay-as-you-go consumption.$lsn$,
    $lsn$treating the cloud model (public/private/hybrid) as the same thing as the service type (IaaS/PaaS/SaaS).$lsn$,
    $lsn$Where it runs is the cloud model; who manages the stack is the service model.$lsn$,
    $lsn$[{"q":"Name the main concepts introduced in this cloud-computing module.","a":"Cloud computing definition, shared responsibility, deployment models and consumption-based pricing."},{"q":"How is a deployment model different from a cloud service type?","a":"The deployment model describes how/where cloud resources are organized; the service type describes the delivery model and allocation of management responsibilities."}]$lsn$::jsonb,
    $lsn$https://learn.microsoft.com/en-us/training/modules/describe-cloud-compute/2-introduction-cloud-compute$lsn$,
    2,
    false,
    null,
    false
)
on conflict (slug) do update set
    topic_id = excluded.topic_id,
    position = excluded.position,
    title = excluded.title,
    summary = excluded.summary,
    key_terms = excluded.key_terms,
    real_example = excluded.real_example,
    exam_lens = excluded.exam_lens,
    common_distractor = excluded.common_distractor,
    memory_hook = excluded.memory_hook,
    check_yourself = excluded.check_yourself,
    source_url = excluded.source_url,
    est_read_minutes = excluded.est_read_minutes,
    needs_verification = excluded.needs_verification,
    verify_note = excluded.verify_note;

insert into public.lessons (
    slug,
    topic_id,
    position,
    title,
    summary,
    key_terms,
    real_example,
    exam_lens,
    common_distractor,
    memory_hook,
    check_yourself,
    source_url,
    est_read_minutes,
    needs_verification,
    verify_note,
    reviewed_by_human
)
values (
    $lsn$p1-m1-03-cloud-computing$lsn$,
    (
        select m.id
        from public.topics m
        join public.topics d on m.parent_id = d.id
        where d.title = $lsn$Describe cloud concepts$lsn$
          and m.title = $lsn$Describe cloud computing$lsn$
    ),
    2,
    $lsn$What is cloud computing$lsn$,
    $lsn$Cloud computing delivers computing services such as virtual machines, storage, databases and networking over the internet. Instead of waiting to procure and install physical equipment, an organization can provision resources when needed and release them when demand falls. This makes it easier to respond to changing workloads, experiment and reach users without first building a physical datacenter. Cloud computing is broader than hosting websites: it includes infrastructure and managed capabilities used to build many kinds of solutions.$lsn$,
    $lsn$[{"term":"Provisioning","definition":"Making a computing resource available for use."},{"term":"On-demand","definition":"Available when needed without a long hardware procurement cycle."},{"term":"Cloud resource","definition":"A service or component such as a VM, database, storage account or network."}]$lsn$::jsonb,
    $lsn$During a Kenyan online shop's holiday promotion, engineers could scale an Azure App Service deployment to handle a traffic spike and reduce the configured capacity when the spike passes. They would still monitor the service and validate that scaling behavior meets application requirements.$lsn$,
    $lsn$Be able to recognize cloud computing as delivery of computing services over the internet, not merely access to a website or storage.$lsn$,
    $lsn$defining cloud computing as only remote storage.$lsn$,
    $lsn$Compute, storage, network and managed services delivered on demand.$lsn$,
    $lsn$[{"q":"How would you define cloud computing in one sentence?","a":"Delivery of computing services over a network, commonly the internet."},{"q":"Why can cloud provisioning be faster to adjust than buying physical servers?","a":"Cloud resources can be provisioned and released on demand, whereas physical infrastructure usually requires procurement, installation and capacity planning."}]$lsn$::jsonb,
    $lsn$https://learn.microsoft.com/en-us/training/modules/describe-cloud-compute/3-what-cloud-compute$lsn$,
    1,
    false,
    null,
    false
)
on conflict (slug) do update set
    topic_id = excluded.topic_id,
    position = excluded.position,
    title = excluded.title,
    summary = excluded.summary,
    key_terms = excluded.key_terms,
    real_example = excluded.real_example,
    exam_lens = excluded.exam_lens,
    common_distractor = excluded.common_distractor,
    memory_hook = excluded.memory_hook,
    check_yourself = excluded.check_yourself,
    source_url = excluded.source_url,
    est_read_minutes = excluded.est_read_minutes,
    needs_verification = excluded.needs_verification,
    verify_note = excluded.verify_note;

insert into public.lessons (
    slug,
    topic_id,
    position,
    title,
    summary,
    key_terms,
    real_example,
    exam_lens,
    common_distractor,
    memory_hook,
    check_yourself,
    source_url,
    est_read_minutes,
    needs_verification,
    verify_note,
    reviewed_by_human
)
values (
    $lsn$p1-m1-04-shared-responsibility-model$lsn$,
    (
        select m.id
        from public.topics m
        join public.topics d on m.parent_id = d.id
        where d.title = $lsn$Describe cloud concepts$lsn$
          and m.title = $lsn$Describe cloud computing$lsn$
    ),
    3,
    $lsn$Describe the shared responsibility model$lsn$,
    $lsn$Cloud security responsibilities are divided between the provider and the customer, and the division changes with the service type. The provider always manages physical datacenter facilities and physical infrastructure, while the customer remains responsible for its data, identities and devices. With IaaS, the customer generally manages more of the operating system and workload stack; PaaS transfers more platform maintenance to the provider; SaaS transfers most application-stack operation to the provider. Moving to the cloud therefore changes responsibilities but does not remove the customer's responsibility for secure configuration, data and access.$lsn$,
    $lsn$[{"term":"Shared responsibility model","definition":"Allocation of security and operational duties between a cloud provider and customer."},{"term":"Customer data","definition":"Information the customer stores or processes, for which the customer retains responsibility."},{"term":"Identity and access management","definition":"Controlling which people, applications and devices can access resources."}]$lsn$::jsonb,
    $lsn$A Nairobi SACCO using Azure Database for PostgreSQL still needs to manage database users, permissions, application secrets and lawful handling of member records. Azure operates the managed database infrastructure, but the SACCO's team cannot assume Microsoft is responsible for every access-control or data-governance decision.$lsn$,
    $lsn$Match duties to provider, customer or both, and account for IaaS/PaaS/SaaS differences.$lsn$,
    $lsn$believing the provider automatically owns the customer's data security just because the data is hosted in Azure.$lsn$,
    $lsn$Provider protects the cloud; customer protects what it puts in the cloud—and shared layers depend on the service.$lsn$,
    $lsn$[{"q":"Which responsibilities remain with the customer across cloud service types?","a":"Customer data, identities/accounts, and devices that connect to cloud resources remain customer responsibilities; access and configuration decisions also remain important."},{"q":"Why does running a database on an Azure VM leave the customer with more maintenance work than using a managed database service?","a":"With a VM, the customer generally manages the guest OS, patching and installed database software. A managed database shifts more of that platform maintenance to the provider."}]$lsn$::jsonb,
    $lsn$https://learn.microsoft.com/en-us/training/modules/describe-cloud-compute/4-describe-shared-responsibility-model$lsn$,
    2,
    false,
    null,
    false
)
on conflict (slug) do update set
    topic_id = excluded.topic_id,
    position = excluded.position,
    title = excluded.title,
    summary = excluded.summary,
    key_terms = excluded.key_terms,
    real_example = excluded.real_example,
    exam_lens = excluded.exam_lens,
    common_distractor = excluded.common_distractor,
    memory_hook = excluded.memory_hook,
    check_yourself = excluded.check_yourself,
    source_url = excluded.source_url,
    est_read_minutes = excluded.est_read_minutes,
    needs_verification = excluded.needs_verification,
    verify_note = excluded.verify_note;

insert into public.lessons (
    slug,
    topic_id,
    position,
    title,
    summary,
    key_terms,
    real_example,
    exam_lens,
    common_distractor,
    memory_hook,
    check_yourself,
    source_url,
    est_read_minutes,
    needs_verification,
    verify_note,
    reviewed_by_human
)
values (
    $lsn$p1-m1-05-define-cloud-models$lsn$,
    (
        select m.id
        from public.topics m
        join public.topics d on m.parent_id = d.id
        where d.title = $lsn$Describe cloud concepts$lsn$
          and m.title = $lsn$Describe cloud computing$lsn$
    ),
    4,
    $lsn$Define cloud models$lsn$,
    $lsn$Cloud deployment models describe how an organization's cloud environment is deployed and who can use its resources. A public cloud is operated by a provider for customers; a private cloud is dedicated to one organization; and a hybrid cloud connects private and public environments. The current Microsoft Learn unit also discusses multicloud, in which an organization uses more than one public cloud provider, and Azure Arc as a way to manage resources across environments. For the January 14, 2026 exam target, prioritize being able to distinguish public, private and hybrid cloud as core objectives, and treat current-page additions cautiously if they do not appear in that dated skills guide.$lsn$,
    $lsn$[{"term":"Public cloud","definition":"Cloud services offered by a third-party provider for use by multiple customers."},{"term":"Private cloud","definition":"A cloud environment dedicated to a single organization."},{"term":"Hybrid cloud","definition":"A connected environment combining private and public cloud resources."},{"term":"Multicloud","definition":"Use of services from two or more cloud providers."},{"term":"Azure Arc","definition":"Azure technology for managing resources across Azure, on-premises and other cloud environments."}]$lsn$::jsonb,
    $lsn$A Kenyan SACCO might keep a legacy member system in its own datacenter while hosting a public-facing API on Azure App Service; when the environments are integrated, that is a hybrid pattern. Azure Arc may help inventory or govern supported servers across the mixed estate, but it does not itself turn the deployment into a new cloud model.$lsn$,
    $lsn$Identify models from requirements involving control, shared infrastructure, connectivity and use of multiple providers.$lsn$,
    $lsn$calling a deployment multicloud merely because it connects an on-premises server to Azure; that is more commonly a hybrid pattern.$lsn$,
    $lsn$Public = provider cloud; private = one organization; hybrid = connected public + private; multicloud = multiple providers.$lsn$,
    $lsn$[{"q":"Which cloud model combines connected public and private environments?","a":"Hybrid cloud."},{"q":"What distinguishes multicloud from hybrid cloud?","a":"Multicloud means using multiple cloud providers; hybrid cloud combines connected public and private environments."}]$lsn$::jsonb,
    $lsn$https://learn.microsoft.com/en-us/training/modules/describe-cloud-compute/5-define-cloud-models$lsn$,
    2,
    true,
    $lsn$Live Microsoft Learn unit covers multicloud and Azure Arc; prioritize public, private, and hybrid cloud core definitions for the dated baseline.$lsn$,
    false
)
on conflict (slug) do update set
    topic_id = excluded.topic_id,
    position = excluded.position,
    title = excluded.title,
    summary = excluded.summary,
    key_terms = excluded.key_terms,
    real_example = excluded.real_example,
    exam_lens = excluded.exam_lens,
    common_distractor = excluded.common_distractor,
    memory_hook = excluded.memory_hook,
    check_yourself = excluded.check_yourself,
    source_url = excluded.source_url,
    est_read_minutes = excluded.est_read_minutes,
    needs_verification = excluded.needs_verification,
    verify_note = excluded.verify_note;

insert into public.lessons (
    slug,
    topic_id,
    position,
    title,
    summary,
    key_terms,
    real_example,
    exam_lens,
    common_distractor,
    memory_hook,
    check_yourself,
    source_url,
    est_read_minutes,
    needs_verification,
    verify_note,
    reviewed_by_human
)
values (
    $lsn$p1-m1-06-consumption-based-model$lsn$,
    (
        select m.id
        from public.topics m
        join public.topics d on m.parent_id = d.id
        where d.title = $lsn$Describe cloud concepts$lsn$
          and m.title = $lsn$Describe cloud computing$lsn$
    ),
    5,
    $lsn$Describe the consumption-based model$lsn$,
    $lsn$In a consumption-based model, customers pay for the cloud resources they consume and can release capacity when they no longer need it. Traditional capital expenditure (CapEx) often means buying physical infrastructure upfront, while operational expenditure (OpEx) covers ongoing service costs. This approach can reduce the need to buy for peak capacity, but it does not guarantee a low bill: idle resources, poor configuration and unnecessary usage can still cost money. Cost visibility and resource cleanup are therefore operational requirements, not optional details.$lsn$,
    $lsn$[{"term":"Consumption-based pricing","definition":"Charges based on measured resource use or service consumption."},{"term":"CapEx","definition":"Upfront investment in assets such as servers and datacenter equipment."},{"term":"OpEx","definition":"Ongoing spending on services and operations over time."},{"term":"Pay-as-you-go","definition":"A pricing approach in which usage is billed as resources are consumed."}]$lsn$::jsonb,
    $lsn$A Kenyan startup can host a staging API in Azure App Service and use Azure Cost Management to monitor spending. The team should scale down or remove staging resources when testing ends; exact rates and pricing factors must be checked in Microsoft's current pricing pages rather than guessed.$lsn$,
    $lsn$Recognize the link between pay-as-you-go, flexible capacity and a shift from upfront CapEx toward OpEx.$lsn$,
    $lsn$assuming consumption-based pricing means there are no costs when the team forgets to use a resource; provisioned resources can continue to incur charges.$lsn$,
    $lsn$Rent what you need, monitor it, and release what you no longer need.$lsn$,
    $lsn$[{"q":"Explain the difference between CapEx and OpEx in a cloud scenario.","a":"CapEx is upfront investment in assets such as hardware; OpEx is ongoing spending on services and operations."},{"q":"Why can an unused but still provisioned cloud resource create costs?","a":"A provisioned service may consume billable compute, storage or other resources even when no one actively uses it; exact charging depends on the service and configuration."}]$lsn$::jsonb,
    $lsn$https://learn.microsoft.com/en-us/training/modules/describe-cloud-compute/6-describe-consumption-based-model$lsn$,
    2,
    false,
    null,
    false
)
on conflict (slug) do update set
    topic_id = excluded.topic_id,
    position = excluded.position,
    title = excluded.title,
    summary = excluded.summary,
    key_terms = excluded.key_terms,
    real_example = excluded.real_example,
    exam_lens = excluded.exam_lens,
    common_distractor = excluded.common_distractor,
    memory_hook = excluded.memory_hook,
    check_yourself = excluded.check_yourself,
    source_url = excluded.source_url,
    est_read_minutes = excluded.est_read_minutes,
    needs_verification = excluded.needs_verification,
    verify_note = excluded.verify_note;

insert into public.lessons (
    slug,
    topic_id,
    position,
    title,
    summary,
    key_terms,
    real_example,
    exam_lens,
    common_distractor,
    memory_hook,
    check_yourself,
    source_url,
    est_read_minutes,
    needs_verification,
    verify_note,
    reviewed_by_human
)
values (
    $lsn$p1-m2-10-benefits-of-high-availability-and-scalability-in-the-cloud$lsn$,
    (
        select m.id
        from public.topics m
        join public.topics d on m.parent_id = d.id
        where d.title = $lsn$Describe cloud concepts$lsn$
          and m.title = $lsn$Describe the benefits of using cloud services$lsn$
    ),
    1,
    $lsn$Describe the benefits of high availability and scalability in the cloud$lsn$,
    $lsn$High availability aims to keep an application or service usable despite disruptions, and Azure service-level agreements (SLAs) describe applicable service availability commitments. Scalability is the ability to adjust resource capacity to match demand. Vertical scaling changes the capacity of an existing resource, such as adding CPU or memory to a virtual machine, while horizontal scaling adds or removes instances such as VMs or containers. Scaling can reduce overprovisioning, but the design still needs to account for the application, dependencies and specific service capabilities.$lsn$,
    $lsn$[{"term":"High availability","definition":"Designing to keep a service accessible with minimal interruption."},{"term":"SLA","definition":"A service-level agreement that documents service commitments and applicable terms."},{"term":"Vertical scaling","definition":"Increasing or decreasing the capacity of an individual resource."},{"term":"Horizontal scaling","definition":"Adding or removing resource instances."},{"term":"Autoscaling","definition":"Automatically adjusting capacity according to configured conditions."}]$lsn$::jsonb,
    $lsn$A Kenyan e-commerce API running on Azure App Service may scale out when M-Pesa callback volume rises, then scale in when activity drops. To improve availability, its owners must separately review the app's availability options and the current service SLA; autoscaling alone does not guarantee availability.$lsn$,
    $lsn$Distinguish uptime/availability from handling demand, and vertical scaling from horizontal scaling.$lsn$,
    $lsn$more RAM on one VM” is horizontal scaling; it is actually vertical. Don't memorize availability percentages from an example—check the current Microsoft SLA for the named service.$lsn$,
    $lsn$Vertical = bigger; horizontal = more; availability = stays usable.$lsn$,
    $lsn$[{"q":"How does vertical scaling differ from horizontal scaling?","a":"Vertical scaling changes the capacity of one resource; horizontal scaling adds or removes resource instances."},{"q":"What does an SLA tell you, and why doesn't autoscaling alone guarantee high availability?","a":"An SLA documents service commitments and terms. Autoscaling changes capacity with demand but does not by itself remove every failure mode or guarantee availability."}]$lsn$::jsonb,
    $lsn$https://learn.microsoft.com/en-us/training/modules/describe-benefits-use-cloud-services/2-high-availability-scalability-cloud$lsn$,
    2,
    false,
    null,
    false
)
on conflict (slug) do update set
    topic_id = excluded.topic_id,
    position = excluded.position,
    title = excluded.title,
    summary = excluded.summary,
    key_terms = excluded.key_terms,
    real_example = excluded.real_example,
    exam_lens = excluded.exam_lens,
    common_distractor = excluded.common_distractor,
    memory_hook = excluded.memory_hook,
    check_yourself = excluded.check_yourself,
    source_url = excluded.source_url,
    est_read_minutes = excluded.est_read_minutes,
    needs_verification = excluded.needs_verification,
    verify_note = excluded.verify_note;

insert into public.lessons (
    slug,
    topic_id,
    position,
    title,
    summary,
    key_terms,
    real_example,
    exam_lens,
    common_distractor,
    memory_hook,
    check_yourself,
    source_url,
    est_read_minutes,
    needs_verification,
    verify_note,
    reviewed_by_human
)
values (
    $lsn$p1-m2-11-benefits-of-reliability-and-predictability-in-the-cloud$lsn$,
    (
        select m.id
        from public.topics m
        join public.topics d on m.parent_id = d.id
        where d.title = $lsn$Describe cloud concepts$lsn$
          and m.title = $lsn$Describe the benefits of using cloud services$lsn$
    ),
    2,
    $lsn$Describe the benefits of reliability and predictability in the cloud$lsn$,
    $lsn$Reliability is the ability to recover from failures and continue functioning; resilient design may distribute workloads so that a single failure does not necessarily take down the whole solution. Predictability addresses confidence in expected performance and cost. Autoscaling and load balancing can help maintain performance under changing demand, while monitoring usage and forecasting spending can improve cost predictability. The Azure Well-Architected Framework provides broader guidance for designing workloads around these qualities.$lsn$,
    $lsn$[{"term":"Reliability","definition":"Ability to recover from failure and continue operating."},{"term":"Resilience","definition":"Ability to withstand or recover from adverse conditions."},{"term":"Predictability","definition":"Confidence in expected performance or spending."},{"term":"Load balancing","definition":"Distributing incoming work across eligible resources."},{"term":"Azure Well-Architected Framework","definition":"Microsoft's guidance for designing and operating Azure workloads well."}]$lsn$::jsonb,
    $lsn$A Kenyan fintech using Azure App Service can monitor response times with Azure Monitor and use a documented scaling policy to handle bursts. It can also use Azure Cost Management to examine usage trends; a multi-region recovery design would require separate architecture decisions and validation rather than assuming Azure does it automatically.$lsn$,
    $lsn$Reliability means recovery and continued operation; predictability means anticipating performance or cost.$lsn$,
    $lsn$choosing “scalability” when the key requirement is recovering after a failure.$lsn$,
    $lsn$Reliability recovers; predictability forecasts.$lsn$,
    $lsn$[{"q":"What is the difference between reliability and availability?","a":"Availability is whether a service is usable when needed; reliability is the ability to recover from failures and continue functioning."},{"q":"Name one mechanism that can support performance predictability and one practice that can support cost predictability.","a":"Autoscaling or load balancing can support performance predictability; monitoring usage, forecasting and reviewing cost trends can support cost predictability."}]$lsn$::jsonb,
    $lsn$https://learn.microsoft.com/en-us/training/modules/describe-benefits-use-cloud-services/3-reliability-predictability-cloud$lsn$,
    1,
    false,
    null,
    false
)
on conflict (slug) do update set
    topic_id = excluded.topic_id,
    position = excluded.position,
    title = excluded.title,
    summary = excluded.summary,
    key_terms = excluded.key_terms,
    real_example = excluded.real_example,
    exam_lens = excluded.exam_lens,
    common_distractor = excluded.common_distractor,
    memory_hook = excluded.memory_hook,
    check_yourself = excluded.check_yourself,
    source_url = excluded.source_url,
    est_read_minutes = excluded.est_read_minutes,
    needs_verification = excluded.needs_verification,
    verify_note = excluded.verify_note;

insert into public.lessons (
    slug,
    topic_id,
    position,
    title,
    summary,
    key_terms,
    real_example,
    exam_lens,
    common_distractor,
    memory_hook,
    check_yourself,
    source_url,
    est_read_minutes,
    needs_verification,
    verify_note,
    reviewed_by_human
)
values (
    $lsn$p1-m2-12-benefits-of-security-and-governance-in-the-cloud$lsn$,
    (
        select m.id
        from public.topics m
        join public.topics d on m.parent_id = d.id
        where d.title = $lsn$Describe cloud concepts$lsn$
          and m.title = $lsn$Describe the benefits of using cloud services$lsn$
    ),
    3,
    $lsn$Describe the benefits of security and governance in the cloud$lsn$,
    $lsn$Cloud security features and governance tools can help organizations apply consistent controls, audit configurations and identify resources that fall outside requirements. Templates and policy-driven rules can reduce configuration drift when environments are deployed at scale. The appropriate division of maintenance work still depends on the selected service model: IaaS gives the customer more control and operational work, while PaaS and SaaS shift more platform maintenance to the provider. Cloud capabilities support security and governance, but they do not automatically make an application compliant or correctly configured.$lsn$,
    $lsn$[{"term":"Governance control","definition":"A rule or process used to keep resources aligned with organizational requirements."},{"term":"Configuration drift","definition":"Resources gradually deviating from an intended standard."},{"term":"Azure Policy","definition":"Azure service for defining and evaluating organizational rules over resources."},{"term":"Compliance","definition":"Meeting applicable legal, regulatory, contractual or internal requirements."}]$lsn$::jsonb,
    $lsn$A Kenyan SACCO deploying Azure resources can use Azure Policy to restrict resource configurations and Microsoft Defender for Cloud to assess security posture. It must still determine its own obligations under the Kenya Data Protection Act, configure access correctly and verify that the design meets applicable requirements.$lsn$,
    $lsn$Understand how policy, templates, auditing and different service models support security and governance.$lsn$,
    $lsn$treating a cloud provider's certifications or built-in safeguards as automatic proof that a customer's workload is compliant.$lsn$,
    $lsn$Provider capability + customer configuration + governance process.$lsn$,
    $lsn$[{"q":"How can Azure Policy support governance across many resources?","a":"Azure Policy can define/evaluate rules and help enforce or assess resource configurations against organizational requirements."},{"q":"Why does using a cloud service not automatically make a workload compliant?","a":"Customers still configure access, protect data, operate the workload appropriately and determine applicable requirements; provider capabilities do not guarantee correct customer configuration or compliance."}]$lsn$::jsonb,
    $lsn$https://learn.microsoft.com/en-us/training/modules/describe-benefits-use-cloud-services/4-security-governance-cloud$lsn$,
    2,
    false,
    null,
    false
)
on conflict (slug) do update set
    topic_id = excluded.topic_id,
    position = excluded.position,
    title = excluded.title,
    summary = excluded.summary,
    key_terms = excluded.key_terms,
    real_example = excluded.real_example,
    exam_lens = excluded.exam_lens,
    common_distractor = excluded.common_distractor,
    memory_hook = excluded.memory_hook,
    check_yourself = excluded.check_yourself,
    source_url = excluded.source_url,
    est_read_minutes = excluded.est_read_minutes,
    needs_verification = excluded.needs_verification,
    verify_note = excluded.verify_note;

insert into public.lessons (
    slug,
    topic_id,
    position,
    title,
    summary,
    key_terms,
    real_example,
    exam_lens,
    common_distractor,
    memory_hook,
    check_yourself,
    source_url,
    est_read_minutes,
    needs_verification,
    verify_note,
    reviewed_by_human
)
values (
    $lsn$p1-m2-13-benefits-of-manageability-in-the-cloud$lsn$,
    (
        select m.id
        from public.topics m
        join public.topics d on m.parent_id = d.id
        where d.title = $lsn$Describe cloud concepts$lsn$
          and m.title = $lsn$Describe the benefits of using cloud services$lsn$
    ),
    4,
    $lsn$Describe the benefits of manageability in the cloud$lsn$,
    $lsn$Cloud manageability includes the ways resources can be administered and the ways their operation can be automated. Management capabilities include autoscaling, deploying standard templates, monitoring resource health and raising alerts. Management interfaces include a portal, command-line tools, APIs and PowerShell. The important distinction is between what the platform can automate or expose and the operating procedures the customer chooses to build around those capabilities.$lsn$,
    $lsn$[{"term":"Azure portal","definition":"Web-based interface for managing Azure resources."},{"term":"Azure CLI","definition":"Cross-platform command-line interface for managing Azure."},{"term":"Infrastructure as code (IaC)","definition":"Defining infrastructure declaratively or through files so it can be consistently deployed."},{"term":"Monitoring alert","definition":"A notification triggered by a configured condition or metric."}]$lsn$::jsonb,
    $lsn$A backend engineer can deploy a FastAPI app to Azure App Service using an Azure CLI pipeline, provision repeatable infrastructure with an ARM/Bicep template, and monitor health with Azure Monitor. That workflow is manageable because deployment and observation are repeatable rather than dependent on ad hoc portal clicks.$lsn$,
    $lsn$Questions may distinguish resource-management capabilities (automation, health monitoring, templates) from the interfaces used to operate Azure (portal, CLI, API, PowerShell).$lsn$,
    $lsn$assuming manageability means only a web portal.$lsn$,
    $lsn$Automate the resource; choose the interface.$lsn$,
    $lsn$[{"q":"Name two ways to manage Azure resources and two capabilities that can automate resource operation.","a":"Interfaces: Azure portal, Azure CLI, APIs, PowerShell. Operational capabilities: templates/IaC, autoscaling, resource-health monitoring or alerts."},{"q":"How is monitoring resource health different from choosing a management interface?","a":"Monitoring observes resource health and conditions; a management interface is the method used to administer the environment."}]$lsn$::jsonb,
    $lsn$https://learn.microsoft.com/en-us/training/modules/describe-benefits-use-cloud-services/5-manageability-cloud$lsn$,
    1,
    false,
    null,
    false
)
on conflict (slug) do update set
    topic_id = excluded.topic_id,
    position = excluded.position,
    title = excluded.title,
    summary = excluded.summary,
    key_terms = excluded.key_terms,
    real_example = excluded.real_example,
    exam_lens = excluded.exam_lens,
    common_distractor = excluded.common_distractor,
    memory_hook = excluded.memory_hook,
    check_yourself = excluded.check_yourself,
    source_url = excluded.source_url,
    est_read_minutes = excluded.est_read_minutes,
    needs_verification = excluded.needs_verification,
    verify_note = excluded.verify_note;

insert into public.lessons (
    slug,
    topic_id,
    position,
    title,
    summary,
    key_terms,
    real_example,
    exam_lens,
    common_distractor,
    memory_hook,
    check_yourself,
    source_url,
    est_read_minutes,
    needs_verification,
    verify_note,
    reviewed_by_human
)
values (
    $lsn$p1-m2-14-sustainability-considerations-in-the-cloud$lsn$,
    (
        select m.id
        from public.topics m
        join public.topics d on m.parent_id = d.id
        where d.title = $lsn$Describe cloud concepts$lsn$
          and m.title = $lsn$Describe the benefits of using cloud services$lsn$
    ),
    5,
    $lsn$Describe sustainability considerations in the cloud$lsn$,
    $lsn$The current Microsoft Learn unit links cloud sustainability to efficient use of infrastructure and avoidance of unnecessary resource consumption. Rightsizing, shutting down unused environments, automating schedules and monitoring utilization can reduce waste as well as unnecessary spending. Large-scale cloud infrastructure can improve utilization, but sustainability benefits depend on how workloads are designed and operated. This unit appears in the current learning path; because the target skills-measured baseline is January 14, 2026 and the live training content may be newer, treat it as supporting context unless the dated guide explicitly lists it as a required objective.$lsn$,
    $lsn$[{"term":"Rightsizing","definition":"Matching resource capacity to actual workload needs."},{"term":"Overprovisioning","definition":"Allocating more capacity than a workload requires."},{"term":"Resource deallocation","definition":"Releasing compute capacity so it is no longer running or allocated as before."},{"term":"Sustainability","definition":"Operating in ways that consider long-term environmental resource use and impact."}]$lsn$::jsonb,
    $lsn$A Nairobi tech startup's development environment on Azure App Service could be scheduled or configured so that non-production resources are not kept unnecessarily active outside working hours, where the chosen services support that pattern. The team can use Azure Cost Management and monitoring data to find waste; exact savings must be measured, not assumed.$lsn$,
    $lsn$For the January 14 target, this is lower priority than the explicitly listed core cloud benefits unless the historical guide includes it. If questioned, connect sustainability with efficient utilization and reducing idle resources.$lsn$,
    $lsn$assuming that putting every workload in the cloud automatically guarantees a lower environmental footprint.$lsn$,
    $lsn$Right-size, switch off, monitor, optimize.$lsn$,
    $lsn$[{"q":"Name two operational habits that can reduce unnecessary cloud resource use.","a":"Right-size resources, shut down/deallocate unused capacity, schedule non-production workloads, or monitor usage and optimize configuration."},{"q":"Why should sustainability in the cloud not be assumed to happen automatically?","a":"Inefficient deployments can leave resources overprovisioned or idle; sustainability depends on how resources are selected, configured and operated."}]$lsn$::jsonb,
    $lsn$https://learn.microsoft.com/en-us/training/modules/describe-benefits-use-cloud-services/5a-describe-sustainability-cloud$lsn$,
    2,
    true,
    $lsn$Sustainability considerations appear in current training; treat as supporting context unless explicitly listed in your exam baseline.$lsn$,
    false
)
on conflict (slug) do update set
    topic_id = excluded.topic_id,
    position = excluded.position,
    title = excluded.title,
    summary = excluded.summary,
    key_terms = excluded.key_terms,
    real_example = excluded.real_example,
    exam_lens = excluded.exam_lens,
    common_distractor = excluded.common_distractor,
    memory_hook = excluded.memory_hook,
    check_yourself = excluded.check_yourself,
    source_url = excluded.source_url,
    est_read_minutes = excluded.est_read_minutes,
    needs_verification = excluded.needs_verification,
    verify_note = excluded.verify_note;

insert into public.lessons (
    slug,
    topic_id,
    position,
    title,
    summary,
    key_terms,
    real_example,
    exam_lens,
    common_distractor,
    memory_hook,
    check_yourself,
    source_url,
    est_read_minutes,
    needs_verification,
    verify_note,
    reviewed_by_human
)
values (
    $lsn$p1-m3-18-infrastructure-as-a-service$lsn$,
    (
        select m.id
        from public.topics m
        join public.topics d on m.parent_id = d.id
        where d.title = $lsn$Describe cloud concepts$lsn$
          and m.title = $lsn$Describe cloud service types$lsn$
    ),
    1,
    $lsn$Describe Infrastructure as a Service$lsn$,
    $lsn$IaaS provides access to computing infrastructure while leaving the customer substantial control over the workload. The provider maintains the physical datacenter, hosts and foundational connectivity, while the customer typically manages the operating system, many network and security settings, and installed software. This flexibility makes IaaS useful for workloads that need operating-system control or a migration with few application changes. The trade-off is more patching, configuration, monitoring and maintenance work for the customer.$lsn$,
    $lsn$[{"term":"Infrastructure as a Service (IaaS)","definition":"A model in which a provider supplies infrastructure and the customer manages much of the software stack."},{"term":"Virtual machine (VM)","definition":"A software-defined computer with an operating system and allocated virtual resources."},{"term":"Lift and shift","definition":"Moving a workload to a new environment with relatively limited application redesign."},{"term":"Operating-system patching","definition":"Applying updates that fix bugs or security issues in the OS."}]$lsn$::jsonb,
    $lsn$A Kenyan logistics company could move a legacy application to Azure Virtual Machines when it needs control over the operating system and installed dependencies. Its engineers would still be responsible for OS updates, application configuration, access settings and many workload-level security tasks.$lsn$,
    $lsn$IaaS is often the best fit when the scenario calls for maximum control or lift-and-shift compatibility.$lsn$,
    $lsn$assuming Azure manages the guest OS just because it manages the physical host.$lsn$,
    $lsn$Azure owns the hardware; you own most of the VM workload.$lsn$,
    $lsn$[{"q":"Which operating-system responsibilities generally remain with a customer using Azure Virtual Machines?","a":"The customer generally manages the VM's guest OS, updates/patches, installed software, workload configuration and many security controls."},{"q":"Why can IaaS be suitable for a lift-and-shift migration?","a":"The VM provides control over the operating system and installed environment, so an existing workload can sometimes move with fewer application changes."}]$lsn$::jsonb,
    $lsn$https://learn.microsoft.com/en-us/training/modules/describe-cloud-service-types/2-describe-infrastructure-service$lsn$,
    2,
    false,
    null,
    false
)
on conflict (slug) do update set
    topic_id = excluded.topic_id,
    position = excluded.position,
    title = excluded.title,
    summary = excluded.summary,
    key_terms = excluded.key_terms,
    real_example = excluded.real_example,
    exam_lens = excluded.exam_lens,
    common_distractor = excluded.common_distractor,
    memory_hook = excluded.memory_hook,
    check_yourself = excluded.check_yourself,
    source_url = excluded.source_url,
    est_read_minutes = excluded.est_read_minutes,
    needs_verification = excluded.needs_verification,
    verify_note = excluded.verify_note;

insert into public.lessons (
    slug,
    topic_id,
    position,
    title,
    summary,
    key_terms,
    real_example,
    exam_lens,
    common_distractor,
    memory_hook,
    check_yourself,
    source_url,
    est_read_minutes,
    needs_verification,
    verify_note,
    reviewed_by_human
)
values (
    $lsn$p1-m3-19-platform-as-a-service$lsn$,
    (
        select m.id
        from public.topics m
        join public.topics d on m.parent_id = d.id
        where d.title = $lsn$Describe cloud concepts$lsn$
          and m.title = $lsn$Describe cloud service types$lsn$
    ),
    2,
    $lsn$Describe Platform as a Service$lsn$,
    $lsn$PaaS provides a managed application platform so teams can concentrate on their application and data rather than maintaining the underlying server operating system and runtime platform. The provider handles the physical infrastructure and key platform components, which commonly include operating systems, middleware and managed runtime services. PaaS can reduce routine operations and accelerate development, but customers remain responsible for application behavior, data, identities and correct configuration of the service. It therefore reduces infrastructure management rather than eliminating the need for engineering or security practices.$lsn$,
    $lsn$[{"term":"Platform as a Service (PaaS)","definition":"A cloud model in which the provider manages the platform needed to run applications."},{"term":"Managed runtime","definition":"An execution environment operated and maintained by the provider."},{"term":"Middleware","definition":"Software connecting applications or services and supporting their operation."},{"term":"Application deployment","definition":"Releasing application code and configuration to an environment where it runs."}]$lsn$::jsonb,
    $lsn$A backend engineer can deploy a typed FastAPI application to Azure App Service and use Azure Database for PostgreSQL for relational storage. The provider manages important platform infrastructure, while the team still owns API validation, authorization, SQL correctness, migrations, secrets and data protection.$lsn$,
    $lsn$PaaS fits developers who want to build and deploy code without managing the underlying OS and platform components.$lsn$,
    $lsn$treating PaaS as a fully managed application where customers do not manage their own code or data.$lsn$,
    $lsn$Provider manages the platform; you manage your application and data.$lsn$,
    $lsn$[{"q":"Which responsibilities are moved to the provider when a team chooses PaaS over IaaS?","a":"The provider manages more of the physical infrastructure and platform, such as OS and managed runtime components."},{"q":"What responsibilities does a FastAPI team retain when it deploys to Azure App Service?","a":"The team remains responsible for code, application behavior, data, application secrets, authorization, SQL correctness, migrations and service configuration."}]$lsn$::jsonb,
    $lsn$https://learn.microsoft.com/en-us/training/modules/describe-cloud-service-types/3-describe-platform-service$lsn$,
    2,
    false,
    null,
    false
)
on conflict (slug) do update set
    topic_id = excluded.topic_id,
    position = excluded.position,
    title = excluded.title,
    summary = excluded.summary,
    key_terms = excluded.key_terms,
    real_example = excluded.real_example,
    exam_lens = excluded.exam_lens,
    common_distractor = excluded.common_distractor,
    memory_hook = excluded.memory_hook,
    check_yourself = excluded.check_yourself,
    source_url = excluded.source_url,
    est_read_minutes = excluded.est_read_minutes,
    needs_verification = excluded.needs_verification,
    verify_note = excluded.verify_note;

insert into public.lessons (
    slug,
    topic_id,
    position,
    title,
    summary,
    key_terms,
    real_example,
    exam_lens,
    common_distractor,
    memory_hook,
    check_yourself,
    source_url,
    est_read_minutes,
    needs_verification,
    verify_note,
    reviewed_by_human
)
values (
    $lsn$p1-m3-20-software-as-a-service$lsn$,
    (
        select m.id
        from public.topics m
        join public.topics d on m.parent_id = d.id
        where d.title = $lsn$Describe cloud concepts$lsn$
          and m.title = $lsn$Describe cloud service types$lsn$
    ),
    3,
    $lsn$Describe Software as a Service$lsn$,
    $lsn$SaaS gives customers access to a complete provider-operated application instead of asking them to manage the infrastructure and platform themselves. It usually has the lowest operational overhead of the three models, though it offers less control over the underlying implementation. Customers still need to manage their data, user accounts, access rights and device or organizational settings. Common use cases include collaboration, email, productivity and business applications.$lsn$,
    $lsn$[{"term":"Software as a Service (SaaS)","definition":"A complete application delivered as a cloud service."},{"term":"Operational overhead","definition":"The ongoing work needed to deploy, maintain, update and operate a solution."},{"term":"Tenant configuration","definition":"Settings that govern an organization's use of a shared cloud application."},{"term":"Least privilege","definition":"Giving users only the access required for their responsibilities."}]$lsn$::jsonb,
    $lsn$A Kenyan SACCO may use Microsoft 365 as SaaS for email and collaboration while operating its own API on Azure App Service. The SaaS provider maintains the application, but the SACCO still needs to control staff accounts, sharing permissions, data retention and access policies; Azure App Service remains a separate Azure service for the custom backend.$lsn$,
    $lsn$SaaS usually fits when the requirement is to use a complete application with minimal infrastructure management.$lsn$,
    $lsn$saying SaaS means the customer has no security or data responsibilities.$lsn$,
    $lsn$Use the finished software; manage your users and data.$lsn$,
    $lsn$[{"q":"Why does SaaS generally involve less customer operational work than IaaS?","a":"The provider operates most of the application stack and application maintenance, so the customer performs less infrastructure and platform management."},{"q":"Name two responsibilities the customer still has when using SaaS.","a":"Examples include user/account management, access permissions, data governance/retention and appropriate device or sharing configuration."}]$lsn$::jsonb,
    $lsn$https://learn.microsoft.com/en-us/training/modules/describe-cloud-service-types/4-describe-software-service$lsn$,
    2,
    false,
    null,
    false
)
on conflict (slug) do update set
    topic_id = excluded.topic_id,
    position = excluded.position,
    title = excluded.title,
    summary = excluded.summary,
    key_terms = excluded.key_terms,
    real_example = excluded.real_example,
    exam_lens = excluded.exam_lens,
    common_distractor = excluded.common_distractor,
    memory_hook = excluded.memory_hook,
    check_yourself = excluded.check_yourself,
    source_url = excluded.source_url,
    est_read_minutes = excluded.est_read_minutes,
    needs_verification = excluded.needs_verification,
    verify_note = excluded.verify_note;

-- Backfill questions.lesson_id for Path 1
update public.questions q
set lesson_id = l.id
from public.lessons l
where q.skill_ref = l.source_url
  and q.lesson_id is distinct from l.id;
