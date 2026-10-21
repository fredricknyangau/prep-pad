-- =============================================================================
-- lessons_path2.sql
-- AZ-900 Prep Coach — Seed for Path 2: Describe Azure architecture and services
-- Total lessons: 28
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
    $lsn$p2-m1-02-microsoft-azure$lsn$,
    (
        select m.id
        from public.topics m
        join public.topics d on m.parent_id = d.id
        where d.title = $lsn$Describe Azure architecture and services$lsn$
          and m.title = $lsn$Describe the core architectural components of Azure$lsn$
    ),
    1,
    $lsn$What is Microsoft Azure$lsn$,
    $lsn$Azure is Microsoft’s cloud platform: a portfolio of services for hosting applications, storing data, networking systems, identity, analytics, and other workloads. Teams can move existing applications to virtual machines or adopt more managed services as their needs evolve. Azure is not just remote virtual machines; it includes managed platform services and event-driven options too.$lsn$,
    $lsn$[{"term":"Azure","definition":"Microsoft’s cloud platform and service portfolio."},{"term":"Managed service","definition":"A cloud service where Microsoft operates some of the underlying infrastructure or platform."},{"term":"Workload","definition":"An application, service, or task that consumes computing resources."}]$lsn$::jsonb,
    $lsn$A Kenyan fintech could run its FastAPI API on Azure App Service, persist records in Azure Database for PostgreSQL, store receipts in Azure Blob Storage, and use Microsoft Entra ID to govern staff access.$lsn$,
    $lsn$The exam may ask what Azure is or which broad category of service fits a need.$lsn$,
    $lsn$assuming every Azure workload requires the customer to administer an operating system.$lsn$,
    $lsn$Azure offers building blocks at different management levels.$lsn$,
    $lsn$[{"q":"Give a one-sentence definition of Azure.","a":"Azure is Microsoft’s cloud platform and service portfolio for building, deploying, and operating many kinds of workloads."},{"q":"Name three different workload needs Azure services can support.","a":"Examples include compute/hosting, storage, networking, databases, identity/security, analytics, and AI."}]$lsn$::jsonb,
    $lsn$https://learn.microsoft.com/en-us/training/modules/describe-core-architectural-components-of-azure/2-what-microsoft-azure$lsn$,
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
    $lsn$p2-m1-03-get-started-with-azure-accounts$lsn$,
    (
        select m.id
        from public.topics m
        join public.topics d on m.parent_id = d.id
        where d.title = $lsn$Describe Azure architecture and services$lsn$
          and m.title = $lsn$Describe the core architectural components of Azure$lsn$
    ),
    2,
    $lsn$Get started with Azure accounts$lsn$,
    $lsn$An Azure account provides access to Azure, while an Azure subscription is the billing and management boundary in which resources are created. One account can be associated with multiple subscriptions, such as separate development, testing, and production subscriptions. Resources are then created within a subscription and can be organized into resource groups. Free-account offers and included services change, so consult Microsoft’s current offer page before relying on any terms.$lsn$,
    $lsn$[{"term":"Azure account","definition":"The account used to access Azure and manage subscriptions."},{"term":"Subscription","definition":"A boundary for Azure resource management and billing."},{"term":"Resource","definition":"An individual Azure service instance, such as a virtual machine or storage account."}]$lsn$::jsonb,
    $lsn$A Nairobi developer team separates a staging API from production using different subscriptions, with Azure App Service and Azure Database for PostgreSQL created in the appropriate subscription.$lsn$,
    $lsn$Test the relationship among account, subscription, resource group, and resource.$lsn$,
    $lsn$saying the subscription itself is a virtual network or a physical datacenter.$lsn$,
    $lsn$account accesses; subscription scopes billing/governance; groups organize; resources do work.$lsn$,
    $lsn$[{"q":"What purpose does an Azure subscription serve?","a":"A subscription is a management and billing boundary for Azure resources."},{"q":"Can one Azure account be associated with multiple subscriptions, and why might a team do that?","a":"Yes. Separate subscriptions can isolate environments such as development, testing, production, or sandbox workloads."}]$lsn$::jsonb,
    $lsn$https://learn.microsoft.com/en-us/training/modules/describe-core-architectural-components-of-azure/3-get-started-azure-accounts$lsn$,
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
    $lsn$p2-m1-04-physical-infrastructure$lsn$,
    (
        select m.id
        from public.topics m
        join public.topics d on m.parent_id = d.id
        where d.title = $lsn$Describe Azure architecture and services$lsn$
          and m.title = $lsn$Describe the core architectural components of Azure$lsn$
    ),
    3,
    $lsn$Describe Azure physical infrastructure$lsn$,
    $lsn$Azure datacenters house the servers and supporting power, cooling, and networking equipment that run cloud services. Datacenters are organized into regions, and some regions offer availability zones made from physically separate datacenter locations with independent infrastructure. Region pairs can support cross-region resilience, but replication and failover are not automatic for every service or workload. Sovereign regions are designed for particular government, regulatory, or jurisdictional requirements; check Microsoft’s current documentation for region availability and service support.$lsn$,
    $lsn$[{"term":"Datacenter","definition":"A physical facility that contains compute, storage, networking, power, and cooling infrastructure."},{"term":"Region","definition":"A geographic area containing one or more Azure datacenters."},{"term":"Availability zone","definition":"A physically separate location within a region designed to isolate some datacenter-level failures."},{"term":"Region pair","definition":"A designated pairing of regions that can support resilience strategies."}]$lsn$::jsonb,
    $lsn$A Kenyan fintech could deploy redundant application instances across supported availability zones in one Azure region, then separately configure backup or disaster recovery for a regional outage.$lsn$,
    $lsn$This is a high-priority exam topic. Distinguish local fault isolation (availability zones) from geographic disaster recovery (regions/region pairs).$lsn$,
    $lsn$assuming paired regions automatically replicate every workload or guarantee failover.$lsn$,
    $lsn$datacenter → zone/region layout; zones protect within a region, cross-region design protects against regional events.$lsn$,
    $lsn$[{"q":"How does an availability zone differ from a region?","a":"An availability zone is a physically separate location within a region; a region is a geographic deployment area that contains datacenters."},{"q":"Does choosing a region pair guarantee that all workload data is automatically replicated and failed over?","a":"No. Replication, recovery, and failover often require service-specific configuration and validation."}]$lsn$::jsonb,
    $lsn$https://learn.microsoft.com/en-us/training/modules/describe-core-architectural-components-of-azure/5-describe-azure-physical-infrastructure$lsn$,
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
    $lsn$p2-m1-05-management-infrastructure$lsn$,
    (
        select m.id
        from public.topics m
        join public.topics d on m.parent_id = d.id
        where d.title = $lsn$Describe Azure architecture and services$lsn$
          and m.title = $lsn$Describe the core architectural components of Azure$lsn$
    ),
    4,
    $lsn$Describe Azure management infrastructure$lsn$,
    $lsn$Azure management infrastructure organizes the resources a customer creates. A resource is placed in a resource group; resource groups belong to subscriptions; and subscriptions can be grouped under management groups for governance across multiple subscriptions. Resource groups are logical management containers rather than physical locations, and resources in one group do not have to be hosted on the same kind of infrastructure. Scope and inherited policy or access settings depend on the level where they are assigned.$lsn$,
    $lsn$[{"term":"Resource group","definition":"A logical container used to manage related Azure resources."},{"term":"Management group","definition":"A scope above subscriptions used to organize and govern multiple subscriptions."},{"term":"Scope","definition":"The boundary at which a role, policy, or management setting applies."}]$lsn$::jsonb,
    $lsn$A Nairobi fintech startup might use a management group for all company subscriptions, a production subscription for customer-facing workloads, and separate resource groups for the API, observability, and storage resources.$lsn$,
    $lsn$Expect hierarchy and scope questions.$lsn$,
    $lsn$placing a resource group above a subscription or treating a resource group as a region.$lsn$,
    $lsn$management group → subscription → resource group → resource.$lsn$,
    $lsn$[{"q":"State the Azure management hierarchy from broadest to most specific.","a":"Management group → subscription → resource group → resource."},{"q":"Are resource groups physical containers in a datacenter?","a":"No. A resource group is a logical management container."}]$lsn$::jsonb,
    $lsn$https://learn.microsoft.com/en-us/training/modules/describe-core-architectural-components-of-azure/6-describe-azure-management-infrastructure$lsn$,
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
    $lsn$p2-m2-09-virtual-machines$lsn$,
    (
        select m.id
        from public.topics m
        join public.topics d on m.parent_id = d.id
        where d.title = $lsn$Describe Azure architecture and services$lsn$
          and m.title = $lsn$Describe Azure compute services$lsn$
    ),
    1,
    $lsn$Describe Azure virtual machines$lsn$,
    $lsn$Azure Virtual Machines provide virtualized servers where the customer chooses an operating system and controls much of the software stack. A VM deployment involves choices such as image, size, disks, network interface, and configuration. Virtual Machine Scale Sets help manage groups of VMs that can scale, while availability sets distribute VMs across fault and update domains within the datacenter architecture supported by the service. VMs are useful when workloads need OS-level control, legacy compatibility, or custom software that is not supported by a more managed host.$lsn$,
    $lsn$[{"term":"Virtual machine (VM)","definition":"A software-defined computer with its own operating system environment."},{"term":"VM image","definition":"A template used to create a VM operating system and initial configuration."},{"term":"Virtual Machine Scale Set","definition":"A service for deploying and managing a group of load-balanced, scalable VMs."},{"term":"Availability set","definition":"A VM organization option that helps reduce correlated impact from planned maintenance and hardware faults."}]$lsn$::jsonb,
    $lsn$A Kenyan payments provider with a legacy application requiring a specific OS agent could use Azure Virtual Machines, while putting its public API on a managed host if full OS control is unnecessary.$lsn$,
    $lsn$High-priority service-selection topic. Questions may distinguish VM from PaaS, Scale Sets from availability sets, and guest OS control from managed operations.$lsn$,
    $lsn$assuming a VM automatically scales or gives zone/region disaster recovery.$lsn$,
    $lsn$VM = most OS control, more operations responsibility.$lsn$,
    $lsn$[{"q":"When might a VM be a better choice than a fully managed web host?","a":"When an application needs OS-level control, custom software, legacy compatibility, or configuration unavailable on a managed platform."},{"q":"What problem does a Virtual Machine Scale Set address, and how is that different from an availability set?","a":"Scale Sets manage groups of VMs and support scaling; availability sets distribute VMs to reduce correlated update or hardware-failure impact within their supported scope."}]$lsn$::jsonb,
    $lsn$https://learn.microsoft.com/en-us/training/modules/describe-azure-compute-networking-services/2-virtual-machines$lsn$,
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
    $lsn$p2-m2-10-virtual-desktop$lsn$,
    (
        select m.id
        from public.topics m
        join public.topics d on m.parent_id = d.id
        where d.title = $lsn$Describe Azure architecture and services$lsn$
          and m.title = $lsn$Describe Azure compute services$lsn$
    ),
    2,
    $lsn$Describe Azure virtual desktop$lsn$,
    $lsn$Azure Virtual Desktop delivers virtualized Windows desktops and applications to users over a network. The desktop workloads run on Azure infrastructure, while users connect from supported client devices. It is intended for centralized desktop delivery, remote work, and controlled access to business applications rather than for hosting a public web API. The organization still needs to plan identity, user access, host pools, networking, and the service configuration.$lsn$,
    $lsn$[{"term":"Azure Virtual Desktop (AVD)","definition":"A service for delivering virtual Windows desktops and remote applications."},{"term":"Host pool","definition":"A group of session hosts that provide desktops or remote applications."},{"term":"Remote desktop","definition":"A desktop session accessed remotely instead of running entirely on the user’s local device."}]$lsn$::jsonb,
    $lsn$A Kenyan SACCO could provide branch staff and approved remote auditors with managed desktops and finance applications through Azure Virtual Desktop without installing every business application on each personal laptop.$lsn$,
    $lsn$Exam questions test the workload this service solves.$lsn$,
    $lsn$choosing Azure Virtual Desktop to host an internet-facing web API or confusing it with Azure Virtual Machines as a general server product.$lsn$,
    $lsn$AVD delivers user desktops/apps; VM is a general compute building block.$lsn$,
    $lsn$[{"q":"What problem does Azure Virtual Desktop solve?","a":"It delivers virtual Windows desktops and remote applications to users."},{"q":"Why is AVD not simply the same thing as deploying a web application to a VM?","a":"AVD focuses on end-user desktop/application sessions; a general VM is a server workload building block that the customer configures for many possible purposes."}]$lsn$::jsonb,
    $lsn$https://learn.microsoft.com/en-us/training/modules/describe-azure-compute-networking-services/4-virtual-desktop$lsn$,
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
    $lsn$p2-m2-11-containers$lsn$,
    (
        select m.id
        from public.topics m
        join public.topics d on m.parent_id = d.id
        where d.title = $lsn$Describe Azure architecture and services$lsn$
          and m.title = $lsn$Describe Azure compute services$lsn$
    ),
    3,
    $lsn$Describe Azure containers$lsn$,
    $lsn$A container packages an application and its dependencies into an isolated, portable unit that runs using the host operating-system kernel. Containers are typically faster to start and lighter than separate full virtual machines, but isolation and operating-system boundaries differ. Azure offers services at different management levels, including Azure Container Instances for straightforward container execution, Azure Container Apps for managed application workloads, and Azure Kubernetes Service for orchestrating containerized applications. Choose according to scaling, orchestration, networking, and operational needs rather than assuming every application requires Kubernetes.$lsn$,
    $lsn$[{"term":"Container","definition":"A packaged application process and its dependencies."},{"term":"Container image","definition":"A versioned template from which containers are created."},{"term":"Orchestration","definition":"Automated deployment, scheduling, scaling, and management of containers."},{"term":"Azure Kubernetes Service (AKS)","definition":"Azure’s managed Kubernetes service."}]$lsn$::jsonb,
    $lsn$A fintech could package a FastAPI API and its dependencies as a container, then deploy it to Azure Container Apps for a managed web workload or AKS if its architecture requires Kubernetes orchestration.$lsn$,
    $lsn$Know the difference between a container, a VM, and container orchestration.$lsn$,
    $lsn$saying containers include a separate full guest OS just like a VM, or that Kubernetes is required for every container.$lsn$,
    $lsn$image packages; container runs; orchestrator coordinates many.$lsn$,
    $lsn$[{"q":"How does a container differ from a virtual machine?","a":"A container shares the host kernel and packages an isolated process and dependencies; a VM virtualizes a machine with its own guest OS."},{"q":"When might AKS be more appropriate than running one container directly?","a":"When the workload needs Kubernetes-based orchestration of multiple containerized components, scheduling, scaling, and related controls."}]$lsn$::jsonb,
    $lsn$https://learn.microsoft.com/en-us/training/modules/describe-azure-compute-networking-services/5-containers$lsn$,
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
    $lsn$p2-m2-12-functions$lsn$,
    (
        select m.id
        from public.topics m
        join public.topics d on m.parent_id = d.id
        where d.title = $lsn$Describe Azure architecture and services$lsn$
          and m.title = $lsn$Describe Azure compute services$lsn$
    ),
    4,
    $lsn$Describe Azure functions$lsn$,
    $lsn$Azure Functions is a serverless compute service for running code in response to triggers such as HTTP requests, timers, messages, or events from other services. Developers focus on function code and configuration rather than managing a dedicated server for each function. A function can connect to other Azure services and is well suited to event-driven tasks, background processing, and integration glue. “Serverless” does not mean that no servers exist; it means much of the server management is abstracted from the developer.$lsn$,
    $lsn$[{"term":"Azure Functions","definition":"A serverless compute service for event-driven code."},{"term":"Trigger","definition":"The event or invocation that starts a function execution."},{"term":"Binding","definition":"A declarative connection between a function and an input or output service."}]$lsn$::jsonb,
    $lsn$After a Kenyan merchant’s payment callback is received, an Azure Function could validate the event, enqueue downstream work, or process a scheduled reconciliation; durable payment state and idempotency still need deliberate design.$lsn$,
    $lsn$High-priority selection topic. Match Functions to trigger/event-driven execution, not long-lived server administration.$lsn$,
    $lsn$interpreting serverless as no underlying servers, or confusing Functions with Azure App Service for a conventional web application.$lsn$,
    $lsn$an event triggers a function.$lsn$,
    $lsn$[{"q":"What does serverless mean in the context of Azure Functions?","a":"Microsoft manages much of the underlying infrastructure, allowing developers to focus on event-driven code; servers still exist underneath."},{"q":"Give two examples of triggers that could start a function.","a":"Examples include an HTTP request, timer, queue/message, or event from another Azure service."}]$lsn$::jsonb,
    $lsn$https://learn.microsoft.com/en-us/training/modules/describe-azure-compute-networking-services/6-functions$lsn$,
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
    $lsn$p2-m2-13-ai-machine-learning-and-iot-edge-services-in-azure$lsn$,
    (
        select m.id
        from public.topics m
        join public.topics d on m.parent_id = d.id
        where d.title = $lsn$Describe Azure architecture and services$lsn$
          and m.title = $lsn$Describe Azure compute services$lsn$
    ),
    5,
    $lsn$Describe AI, machine learning, and IoT/Edge services in Azure$lsn$,
    $lsn$Azure provides services for consuming AI capabilities, building and managing machine-learning models, and connecting devices that generate telemetry. Azure AI services expose ready-made capabilities such as language, vision, or speech features, while Azure Machine Learning supports model development and lifecycle workflows. IoT services help securely connect devices, ingest data, and coordinate solutions; edge computing moves some processing closer to the devices. These are broad service categories, so use Microsoft’s current product documentation for specific capabilities and product availability.$lsn$,
    $lsn$[{"term":"Artificial intelligence (AI)","definition":"Techniques that perform tasks associated with capabilities such as language, vision, or reasoning."},{"term":"Machine learning (ML)","definition":"Methods that learn patterns from data to make predictions or classifications."},{"term":"Internet of Things (IoT)","definition":"Connected physical devices that collect, transmit, or act on data."},{"term":"Edge computing","definition":"Processing performed close to the devices or location that produce the data."}]$lsn$::jsonb,
    $lsn$A Kenyan poultry-farming platform might use an Azure AI service to classify images, Azure Machine Learning to train a feed-consumption forecasting model, and an IoT service to ingest sensor readings from a brooder.$lsn$,
    $lsn$Exam relevance is mostly identifying the service category for the problem statement; product-specific AI details are less central to AZ-900.$lsn$,
    $lsn$assuming Azure AI services, Azure Machine Learning, and IoT device management are the same offering.$lsn$,
    $lsn$use AI capability; build/train ML models; connect devices with IoT; process near devices at the edge.$lsn$,
    $lsn$[{"q":"How does a ready-made Azure AI capability differ from the model-building lifecycle supported by Azure Machine Learning?","a":"A ready-made AI capability offers a prebuilt function/API; Azure Machine Learning supports building, training, managing, and deploying models."},{"q":"What is edge computing, and why might an IoT solution use it?","a":"Edge computing processes some data near its source, potentially reducing latency, bandwidth use, or dependence on a continuous cloud connection."}]$lsn$::jsonb,
    $lsn$https://learn.microsoft.com/en-us/training/modules/describe-azure-compute-networking-services/12a-describe-ai-ml-iot-edge-services$lsn$,
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
    $lsn$p2-m2-14-application-hosting-options$lsn$,
    (
        select m.id
        from public.topics m
        join public.topics d on m.parent_id = d.id
        where d.title = $lsn$Describe Azure architecture and services$lsn$
          and m.title = $lsn$Describe Azure compute services$lsn$
    ),
    6,
    $lsn$Describe application hosting options$lsn$,
    $lsn$Azure application hosting can range from infrastructure you manage yourself to highly managed platforms. Azure Virtual Machines offer extensive OS and runtime control, Azure App Service provides a managed platform for web applications and APIs, and container services run applications packaged as images. The trade-off is control versus operational responsibility: higher abstraction usually reduces server maintenance but may constrain low-level configuration. Pick the host based on runtime requirements, deployment model, scaling needs, and the amount of infrastructure the team wants to manage.$lsn$,
    $lsn$[{"term":"Azure App Service","definition":"A managed platform for hosting web apps, APIs, and related applications."},{"term":"IaaS","definition":"A service model where customers manage the OS and applications while the provider manages underlying infrastructure."},{"term":"PaaS","definition":"A service model where the provider manages more of the application platform."},{"term":"Container hosting","definition":"Running application images using a container service."}]$lsn$::jsonb,
    $lsn$For a standard FastAPI API, a Kenyan software team could compare Azure App Service with Azure Container Apps and Azure Virtual Machines. App Service reduces OS operations; containers keep a consistent package; VMs provide greater OS control.$lsn$,
    $lsn$Expect “which host best fits this requirement?” questions.$lsn$,
    $lsn$assuming App Service requires customers to patch a VM’s guest OS, or that VM is always the most scalable/appropriate.$lsn$,
    $lsn$managed web runtime → App Service; packaged workload → container; OS-level requirement → VM.$lsn$,
    $lsn$[{"q":"Which hosting option usually offers the most direct OS-level control?","a":"Azure Virtual Machines."},{"q":"Why might a team choose Azure App Service over a VM for a web API?","a":"App Service manages more of the hosting platform, reducing server and operating-system maintenance for supported web workloads."}]$lsn$::jsonb,
    $lsn$https://learn.microsoft.com/en-us/training/modules/describe-azure-compute-networking-services/7-describe-application-hosting-options$lsn$,
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
    $lsn$p2-m3-18-virtual-networking$lsn$,
    (
        select m.id
        from public.topics m
        join public.topics d on m.parent_id = d.id
        where d.title = $lsn$Describe Azure architecture and services$lsn$
          and m.title = $lsn$Describe Azure networking services$lsn$
    ),
    1,
    $lsn$Describe Azure virtual networking$lsn$,
    $lsn$Azure Virtual Network provides a private network boundary for Azure resources and supports subnetting, routing, and connectivity with other networks. Subnets divide the address space into smaller logical segments, while VNet peering connects VNets over the Microsoft network subject to configuration and connectivity rules. Network security groups filter inbound and outbound traffic using security rules. Public endpoints can be reachable from public networks, while private endpoints use a private IP path to supported services; check current product documentation for service and networking details.$lsn$,
    $lsn$[{"term":"Subnet","definition":"A partition of a virtual network’s IP address space."},{"term":"VNet peering","definition":"A connection between virtual networks that allows supported traffic to flow between them."},{"term":"Network security group (NSG)","definition":"A rule-based filter for network traffic to or from Azure resources."},{"term":"Private endpoint","definition":"A network interface using a private IP address to privately access a supported service."}]$lsn$::jsonb,
    $lsn$A Kenyan SACCO could place the web tier and data tier in separate subnets and restrict access to Azure Database for PostgreSQL using network controls and private connectivity where supported.$lsn$,
    $lsn$High-priority topic: identify subnets, peering, public/private endpoints, and NSGs by role.$lsn$,
    $lsn$confusing an NSG with a subnet or assuming peering automatically removes every routing or security requirement.$lsn$,
    $lsn$subnet segments; peering connects; NSG filters; private endpoint brings a supported service into a private path.$lsn$,
    $lsn$[{"q":"What is the purpose of a subnet and an NSG?","a":"A subnet partitions VNet address space; an NSG filters traffic according to security rules."},{"q":"How is a private endpoint conceptually different from a public endpoint?","a":"A public endpoint is accessed through a public network address; a private endpoint uses a private IP in a VNet to reach a supported service."}]$lsn$::jsonb,
    $lsn$https://learn.microsoft.com/en-us/training/modules/describe-azure-networking-services/2-virtual-network$lsn$,
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
    $lsn$p2-m3-19-virtual-private-networks$lsn$,
    (
        select m.id
        from public.topics m
        join public.topics d on m.parent_id = d.id
        where d.title = $lsn$Describe Azure architecture and services$lsn$
          and m.title = $lsn$Describe Azure networking services$lsn$
    ),
    2,
    $lsn$Describe Azure virtual private networks$lsn$,
    $lsn$Azure VPN Gateway enables encrypted connections over the internet between Azure virtual networks and other network locations. A site-to-site connection commonly joins an on-premises network to an Azure VNet, while point-to-site allows individual client devices to connect to a virtual network. VNet-to-VNet connections can link separate Azure VNets through VPN connectivity. The gateway and peer network devices still require compatible configuration, routing, and security planning.$lsn$,
    $lsn$[{"term":"VPN Gateway","definition":"An Azure service that provides VPN connectivity between networks or clients and Azure VNets."},{"term":"Site-to-site VPN","definition":"An encrypted tunnel connecting an on-premises network to an Azure VNet."},{"term":"Point-to-site VPN","definition":"A VPN connection from an individual client device to an Azure VNet."}]$lsn$::jsonb,
    $lsn$A Kisumu office could create a site-to-site VPN to an Azure VNet hosting internal services, while an administrator working remotely could use point-to-site access subject to organizational policy.$lsn$,
    $lsn$The exam may ask for the VPN type based on endpoints.$lsn$,
    $lsn$confusing VPN Gateway with ExpressRoute. VPN uses encrypted tunnels over the internet; ExpressRoute provides private connectivity through a connectivity provider.$lsn$,
    $lsn$site-to-site joins networks; point-to-site joins a device.$lsn$,
    $lsn$[{"q":"Which VPN type commonly connects an office network to an Azure VNet?","a":"Site-to-site VPN."},{"q":"Which VPN type is designed for an individual user’s client device?","a":"Point-to-site VPN."}]$lsn$::jsonb,
    $lsn$https://learn.microsoft.com/en-us/training/modules/describe-azure-networking-services/3-virtual-private-networks$lsn$,
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
    $lsn$p2-m3-20-expressroute$lsn$,
    (
        select m.id
        from public.topics m
        join public.topics d on m.parent_id = d.id
        where d.title = $lsn$Describe Azure architecture and services$lsn$
          and m.title = $lsn$Describe Azure networking services$lsn$
    ),
    3,
    $lsn$Describe Azure ExpressRoute$lsn$,
    $lsn$ExpressRoute extends an on-premises network to Microsoft cloud services using a private connection supplied through an ExpressRoute connectivity provider. Unlike a standard VPN connection over the public internet, it is designed to avoid traversing the public internet for the private connection path. It may fit organizations that need predictable connectivity or private access to cloud resources, but it requires connectivity planning and provider support. Exact availability, locations, bandwidth offerings, and commercial terms must be checked on Microsoft’s current documentation.$lsn$,
    $lsn$[{"term":"ExpressRoute","definition":"A private network connectivity service between an organization’s network and Microsoft cloud services."},{"term":"Connectivity provider","definition":"A telecommunications or network provider that supplies the ExpressRoute connection."},{"term":"VPN tunnel","definition":"An encrypted logical connection commonly carried over an existing network such as the internet."}]$lsn$::jsonb,
    $lsn$A Kenyan financial institution connecting a major office or colocation site to Azure might evaluate ExpressRoute if its network requirements and provider availability justify a dedicated private connection.$lsn$,
    $lsn$High-value distinction: ExpressRoute versus VPN Gateway.$lsn$,
    $lsn$saying ExpressRoute is simply an encrypted VPN over the public internet.$lsn$,
    $lsn$VPN tunnel over internet; ExpressRoute private provider connection. Verify current regional and provider support rather than memorizing locations.$lsn$,
    $lsn$[{"q":"What is the key connectivity difference between ExpressRoute and a typical internet-based VPN?","a":"ExpressRoute uses a private connection through a connectivity provider rather than relying on a standard VPN path across the public internet."},{"q":"Name one operational requirement to check before selecting ExpressRoute.","a":"Check provider support, available peering location/region, service capabilities, and current commercial terms in Microsoft documentation."}]$lsn$::jsonb,
    $lsn$https://learn.microsoft.com/en-us/training/modules/describe-azure-networking-services/4-expressroute$lsn$,
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
    $lsn$p2-m3-21-dns$lsn$,
    (
        select m.id
        from public.topics m
        join public.topics d on m.parent_id = d.id
        where d.title = $lsn$Describe Azure architecture and services$lsn$
          and m.title = $lsn$Describe Azure networking services$lsn$
    ),
    4,
    $lsn$Describe Azure DNS$lsn$,
    $lsn$Domain Name System (DNS) translates host names into data such as IP addresses so clients can locate services. Azure DNS hosts DNS domains and records using Azure infrastructure; Azure Private DNS provides name resolution for resources in virtual networks without requiring a public DNS record. DNS resolves names but does not itself provide the route, encrypt traffic, or grant permission to the destination. Public and private DNS zones serve different visibility and resolution needs.$lsn$,
    $lsn$[{"term":"DNS","definition":"The naming system that resolves domain names to records such as IP addresses."},{"term":"DNS zone","definition":"An administrative container for DNS records for a domain or namespace."},{"term":"Azure Private DNS","definition":"A service for managing and resolving private DNS names in Azure VNets."}]$lsn$::jsonb,
    $lsn$A FastAPI service could use a public DNS record for its customer-facing hostname, while internal resources use a private DNS name to resolve a private endpoint or internal service.$lsn$,
    $lsn$The exam tests name resolution, not traffic routing or access control.$lsn$,
    $lsn$assuming Azure DNS hosts an application or creates a VPN.$lsn$,
    $lsn$DNS answers “what address is this name?”—not “may I connect?” or “how does traffic get there?$lsn$,
    $lsn$[{"q":"What does DNS do?","a":"DNS maps names to records, commonly resolving a hostname to an IP address or other DNS data."},{"q":"Why might an organization use Azure Private DNS?","a":"To resolve internal/private names for resources in Azure VNets without exposing those names as public DNS records."}]$lsn$::jsonb,
    $lsn$https://learn.microsoft.com/en-us/training/modules/describe-azure-networking-services/5-domain-name-system$lsn$,
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
    $lsn$p2-m4-25-storage-accounts$lsn$,
    (
        select m.id
        from public.topics m
        join public.topics d on m.parent_id = d.id
        where d.title = $lsn$Describe Azure architecture and services$lsn$
          and m.title = $lsn$Describe Azure storage services$lsn$
    ),
    1,
    $lsn$Describe Azure storage accounts$lsn$,
    $lsn$An Azure Storage account provides a unique namespace for storage data and governs supported services and configuration options. Depending on the account and service, it can support Blob Storage, Azure Files, Queue Storage, Table Storage, and related capabilities. Account choices influence supported data services, performance characteristics, security configuration, and available redundancy options. Check current Microsoft documentation before relying on account types, endpoints, supported features, or regional availability.$lsn$,
    $lsn$[{"term":"Storage account","definition":"A unique Azure namespace that hosts supported storage services."},{"term":"Blob Storage","definition":"Object storage for unstructured data such as images, documents, and logs."},{"term":"Azure Files","definition":"Managed file shares accessible through supported file-sharing protocols."},{"term":"Queue Storage","definition":"A service for storing messages between application components."}]$lsn$::jsonb,
    $lsn$A KukuFiti-style backend could store uploaded poultry-farm images in Blob Storage, shared exports in Azure Files, and use Queue Storage for asynchronous work, with permissions scoped to the application’s needs.$lsn$,
    $lsn$Questions often test storage account role and which service fits a data need.$lsn$,
    $lsn$choosing Blob Storage for a shared SMB file share or assuming an account is just a physical disk.$lsn$,
    $lsn$account is the namespace; the storage service determines the data model.$lsn$,
    $lsn$[{"q":"Why does an application create a storage account?","a":"To provide a namespace and configuration boundary for Azure Storage services and data."},{"q":"Which storage service is usually a better fit for object data such as images: Azure Files or Blob Storage?","a":"Blob Storage."}]$lsn$::jsonb,
    $lsn$https://learn.microsoft.com/en-us/training/modules/describe-azure-storage-services/2-accounts$lsn$,
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
    $lsn$p2-m4-26-storage-redundancy$lsn$,
    (
        select m.id
        from public.topics m
        join public.topics d on m.parent_id = d.id
        where d.title = $lsn$Describe Azure architecture and services$lsn$
          and m.title = $lsn$Describe Azure storage services$lsn$
    ),
    2,
    $lsn$Describe Azure storage redundancy$lsn$,
    $lsn$Azure Storage redundancy creates extra copies to reduce the impact of drive, datacenter, zone, or regional failures. LRS keeps copies within a datacenter; ZRS replicates across availability zones in a supported region; GRS and GZRS add replication to a secondary region. Read-access variants allow access to secondary-region data before failover where supported, while geo-replication is asynchronous and can leave a recovery-point gap. Choose according to failure tolerance, data-residency requirements, read-access needs, and cost; consult current Microsoft documentation for specific service behavior and availability.$lsn$,
    $lsn$[{"term":"LRS","definition":"Locally redundant storage, with copies in one datacenter."},{"term":"ZRS","definition":"Zone-redundant storage, with copies across supported availability zones in a region."},{"term":"GRS","definition":"Geo-redundant storage, with copies replicated to a secondary region."},{"term":"RPO","definition":"Recovery point objective: the point in time to which data can be recovered after an incident."}]$lsn$::jsonb,
    $lsn$A Kenyan fintech might choose zone redundancy for a service requiring resilience to a zone outage and separately decide whether transaction exports also need cross-region replication for regional disaster recovery.$lsn$,
    $lsn$High-priority distinction. The question may describe a disk/datacenter failure, a zone failure, or a regional outage.$lsn$,
    $lsn$assuming geo-replication is always synchronous or that all services fail over automatically.$lsn$,
    $lsn$L = local; Z = zones; G = geography; RA = read access to secondary.$lsn$,
    $lsn$[{"q":"Which is designed for copies across availability zones within a supported region: LRS or ZRS?","a":"ZRS."},{"q":"Does geo-replication automatically guarantee zero data loss and automatic failover for every workload?","a":"No. Cross-region replication may be asynchronous, and recovery/failover behavior varies by service and must be planned/configured."}]$lsn$::jsonb,
    $lsn$https://learn.microsoft.com/en-us/training/modules/describe-azure-storage-services/3-redundancy$lsn$,
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
    $lsn$p2-m4-27-storage-services$lsn$,
    (
        select m.id
        from public.topics m
        join public.topics d on m.parent_id = d.id
        where d.title = $lsn$Describe Azure architecture and services$lsn$
          and m.title = $lsn$Describe Azure storage services$lsn$
    ),
    3,
    $lsn$Describe Azure storage services$lsn$,
    $lsn$Azure Storage provides several services with different data models. Blob Storage handles large unstructured objects; Azure Files provides managed file shares; Queue Storage holds messages for asynchronous processing; Azure Disks provide block storage for VMs; and Azure Tables provide a NoSQL key/attribute store. Blob access tiers include Hot for frequent access, Cool and Cold for less frequent access, and Archive for rarely accessed data with different retrieval expectations. The supported tiers, minimum retention conditions, and current trade-offs should be checked in Microsoft documentation. Selecting the correct service starts with the access pattern and consistency/workload needs, not just the fact that the data is “stored.”$lsn$,
    $lsn$[{"term":"Blob Storage","definition":"Object storage for unstructured data."},{"term":"Azure Files","definition":"Managed shared file storage."},{"term":"Azure Disks","definition":"Block-level storage volumes for Azure VMs."},{"term":"Azure Tables","definition":"A NoSQL store for structured non-relational data."},{"term":"Access tier","definition":"A storage classification aligned with expected data access frequency and retrieval needs."}]$lsn$::jsonb,
    $lsn$A Nairobi SACCO could keep customer-uploaded scans in Blob Storage, use Azure Files for a legacy application needing a shared file system, attach Azure Disks to VMs, and queue document-processing messages in Queue Storage.$lsn$,
    $lsn$Very exam-relevant: match scenario to service.$lsn$,
    $lsn$confuse object storage, file shares, VM disks, messages, and NoSQL entities.$lsn$,
    $lsn$blob = objects; files = shared files; queue = messages; disk = VM block volume; table = NoSQL entities.$lsn$,
    $lsn$[{"q":"Which Azure Storage service is suited to block volumes attached to VMs?","a":"Azure Disks."},{"q":"How do Hot, Cool, Cold, and Archive tiers differ at a high level?","a":"Hot is intended for frequent access; Cool and Cold for less frequent access; Archive for rarely accessed data where retrieval can involve different latency and operational trade-offs. Check current Microsoft documentation for tier-specific conditions."}]$lsn$::jsonb,
    $lsn$https://learn.microsoft.com/en-us/training/modules/describe-azure-storage-services/4-describe-azure-storage-services$lsn$,
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
    $lsn$p2-m4-28-data-migration-options$lsn$,
    (
        select m.id
        from public.topics m
        join public.topics d on m.parent_id = d.id
        where d.title = $lsn$Describe Azure architecture and services$lsn$
          and m.title = $lsn$Describe Azure storage services$lsn$
    ),
    4,
    $lsn$Identify Azure data migration options$lsn$,
    $lsn$Azure Migrate helps assess and coordinate migration of on-premises infrastructure and workloads to Azure, with integrated and partner tools for different workload types. Azure Data Box supports data transfer using a physical device, which can be useful when datasets are very large or network transfer is impractical. These solve different problems: migrating servers and applications is not identical to moving a bulk dataset. Select the approach based on the workload, volume, available bandwidth, logistics, and recovery needs; current device capacities and supported scenarios can change.$lsn$,
    $lsn$[{"term":"Azure Migrate","definition":"A hub and toolset for assessing and migrating workloads to Azure."},{"term":"Azure Data Box","definition":"A physical-device-based service for moving large amounts of data."},{"term":"Migration assessment","definition":"Evaluating workload readiness, dependencies, and target options before moving it."}]$lsn$::jsonb,
    $lsn$A Kenyan institution moving a server estate and databases could use Azure Migrate for assessment and migration planning, while considering Data Box for a large archive that would be slow to upload over available bandwidth.$lsn$,
    $lsn$The exam typically contrasts online workload assessment/migration with physical bulk data transfer.$lsn$,
    $lsn$choosing Data Box for VM assessment or Azure Migrate as merely a command-line file copy tool.$lsn$,
    $lsn$assess/move workloads with Migrate; move bulk data physically with Data Box when appropriate.$lsn$,
    $lsn$[{"q":"Which service is the migration hub for discovering, assessing, and migrating workloads?","a":"Azure Migrate."},{"q":"When might a physical Data Box transfer be preferable to network upload?","a":"When the dataset is very large or network bandwidth/transfer time makes online movement impractical; verify current supported scenarios and device limits."}]$lsn$::jsonb,
    $lsn$https://learn.microsoft.com/en-us/training/modules/describe-azure-storage-services/6-identify-azure-data-migration-options$lsn$,
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
    $lsn$p2-m4-29-file-movement-options$lsn$,
    (
        select m.id
        from public.topics m
        join public.topics d on m.parent_id = d.id
        where d.title = $lsn$Describe Azure architecture and services$lsn$
          and m.title = $lsn$Describe Azure storage services$lsn$
    ),
    5,
    $lsn$Identify Azure file movement options$lsn$,
    $lsn$AzCopy is a command-line utility for copying data to, from, and between Azure Storage locations, making it useful for scripts and repeatable operations. Azure Storage Explorer provides a graphical interface for browsing and managing storage data. Azure File Sync keeps a Windows file server and Azure Files synchronized, supporting hybrid file-share scenarios and optional cloud tiering. They are not interchangeable: a copy tool, a graphical management application, and a continuing hybrid synchronization service solve different tasks.$lsn$,
    $lsn$[{"term":"AzCopy","definition":"A command-line utility for copying data to, from, or between supported storage locations."},{"term":"Azure Storage Explorer","definition":"A graphical application for managing Azure Storage data."},{"term":"Azure File Sync","definition":"A hybrid service that synchronizes file shares between Windows Server and Azure Files."},{"term":"Cloud tiering","definition":"Keeping frequently accessed files locally while retaining less-used content in cloud storage under configured rules."}]$lsn$::jsonb,
    $lsn$A Nairobi accounting office could use AzCopy for a scripted month-end archive upload, Storage Explorer for an administrator’s manual review, and Azure File Sync to maintain a branch file server backed by Azure Files.$lsn$,
    $lsn$Exam questions may specify CLI/script, graphical interface, or ongoing file-share synchronization.$lsn$,
    $lsn$treating AzCopy synchronization as bidirectional like Azure File Sync.$lsn$,
    $lsn$AzCopy copies; Storage Explorer browses; File Sync synchronizes hybrid shares.$lsn$,
    $lsn$[{"q":"Which tool best fits scripted command-line uploads to Azure Storage?","a":"AzCopy."},{"q":"Which option is intended to keep an on-premises Windows file server synchronized with Azure Files?","a":"Azure File Sync."}]$lsn$::jsonb,
    $lsn$https://learn.microsoft.com/en-us/training/modules/describe-azure-storage-services/7-identify-azure-file-movement-options$lsn$,
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
    $lsn$p2-m5-33-directory-services$lsn$,
    (
        select m.id
        from public.topics m
        join public.topics d on m.parent_id = d.id
        where d.title = $lsn$Describe Azure architecture and services$lsn$
          and m.title = $lsn$Describe Azure identity, access, and security$lsn$
    ),
    1,
    $lsn$Describe Azure directory services$lsn$,
    $lsn$Microsoft Entra ID is Microsoft’s cloud identity and access management service for users, applications, devices, and cloud resources. Microsoft Entra Domain Services provides managed domain capabilities such as domain join and familiar domain-based authentication for workloads that need them, without requiring the customer to operate domain controllers directly. Traditional on-premises Active Directory Domain Services and Entra ID are related but are not identical directory technologies or protocols. Choose the directory capability that matches the application’s identity needs and legacy dependencies.$lsn$,
    $lsn$[{"term":"Microsoft Entra ID","definition":"A cloud identity and access management service."},{"term":"Microsoft Entra Domain Services","definition":"Managed domain services for compatible workloads needing domain join or domain-based protocols."},{"term":"Directory service","definition":"A system that stores and manages identity objects and associated attributes."},{"term":"Active Directory Domain Services (AD DS)","definition":"A traditional Windows Server directory service often used for domain join and LDAP/Kerberos-based environments."}]$lsn$::jsonb,
    $lsn$A Nairobi enterprise could use Entra ID for employee sign-in to Azure and SaaS applications, but choose Entra Domain Services for a legacy application that depends on managed domain-join behavior.$lsn$,
    $lsn$High-priority distinction: cloud identity and SSO versus managed domain compatibility.$lsn$,
    $lsn$assuming Entra ID is a direct drop-in replacement for every AD DS feature or protocol.$lsn$,
    $lsn$Entra ID = cloud identity; Entra Domain Services = managed domain features for compatible legacy needs.$lsn$,
    $lsn$[{"q":"What is Microsoft Entra ID primarily used for?","a":"Cloud identity and access management for sign-ins and access to applications/resources."},{"q":"When might Microsoft Entra Domain Services be needed instead of only Entra ID?","a":"When a workload needs managed domain-join or compatible domain-based functionality such as certain LDAP/Kerberos/NTLM patterns."}]$lsn$::jsonb,
    $lsn$https://learn.microsoft.com/en-us/training/modules/describe-azure-identity-access-security/2-directory-services$lsn$,
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
    $lsn$p2-m5-34-authentication-methods$lsn$,
    (
        select m.id
        from public.topics m
        join public.topics d on m.parent_id = d.id
        where d.title = $lsn$Describe Azure architecture and services$lsn$
          and m.title = $lsn$Describe Azure identity, access, and security$lsn$
    ),
    2,
    $lsn$Describe Azure authentication methods$lsn$,
    $lsn$Single sign-on (SSO) allows a user to authenticate once and access multiple permitted applications without re-entering credentials for every app. Multifactor authentication requires more than one independent factor or proof, while passwordless methods let users authenticate without a conventional password, often using a device-bound or cryptographic method. These choices affect user experience and protection against credential theft. Authentication strength should be paired with appropriate authorization and conditional access rather than treated as a complete permission model.$lsn$,
    $lsn$[{"term":"Single sign-on (SSO)","definition":"One authentication event can provide access to multiple authorized applications."},{"term":"Multifactor authentication (MFA)","definition":"Authentication using multiple distinct factor categories."},{"term":"Passwordless authentication","definition":"Authentication that does not rely on entering a conventional password."},{"term":"Authentication factor","definition":"Something a user knows, has, or is, depending on the method."}]$lsn$::jsonb,
    $lsn$A Kenyan SACCO could configure staff SSO to internal cloud apps, require MFA for administrators, and adopt passwordless sign-in for supported devices to reduce reliance on reusable passwords.$lsn$,
    $lsn$Expect term distinction and goal questions.$lsn$,
    $lsn$believing SSO itself requires MFA or that passwordless means no authentication.$lsn$,
    $lsn$SSO reduces repeated sign-ins; MFA adds factor diversity; passwordless changes the credential method.$lsn$,
    $lsn$[{"q":"Does SSO automatically mean that MFA is enabled?","a":"No. SSO and MFA are distinct; an organization can require both through its identity and access policies."},{"q":"What is the defining characteristic of passwordless authentication?","a":"The user does not authenticate by entering a conventional password."}]$lsn$::jsonb,
    $lsn$https://learn.microsoft.com/en-us/training/modules/describe-azure-identity-access-security/3-authentication-methods$lsn$,
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
    $lsn$p2-m5-35-external-identities$lsn$,
    (
        select m.id
        from public.topics m
        join public.topics d on m.parent_id = d.id
        where d.title = $lsn$Describe Azure architecture and services$lsn$
          and m.title = $lsn$Describe Azure identity, access, and security$lsn$
    ),
    3,
    $lsn$Describe Azure external identities$lsn$,
    $lsn$External identity capabilities let an organization collaborate with people who are not members of its workforce directory, such as partners, suppliers, or customers. Microsoft Entra External ID capabilities can support guest or customer identity scenarios, with access controlled by the host organization’s policies. Collaboration should use scoped permissions and a process to review or remove access when the relationship ends. The exact feature path depends on whether the scenario is business-to-business collaboration or customer-facing identity.$lsn$,
    $lsn$[{"term":"External identity","definition":"An identity from outside the organization’s internal workforce."},{"term":"Guest user","definition":"An external person granted controlled access to an organization’s resources."},{"term":"B2B collaboration","definition":"A business-to-business model for allowing partners or other external users to collaborate with a host organization."}]$lsn$::jsonb,
    $lsn$A Nairobi fintech can invite an external auditor as a guest to a limited Microsoft Entra-protected resource instead of creating an unrestricted internal account for the auditor.$lsn$,
    $lsn$The exam is likely to ask how external collaborators receive governed access.$lsn$,
    $lsn$treating every guest as a fully trusted employee or confusing partner collaboration with customer sign-up identity.$lsn$,
    $lsn$external users need explicit, bounded, reviewable access.$lsn$,
    $lsn$[{"q":"Why use an external/guest identity instead of an unrestricted internal workforce account?","a":"It supports collaboration while distinguishing external status and limiting access to what is required."},{"q":"What should happen to a guest’s access when the business relationship ends?","a":"Review and remove or expire access in accordance with the organization’s governance process."}]$lsn$::jsonb,
    $lsn$https://learn.microsoft.com/en-us/training/modules/describe-azure-identity-access-security/4-external-identities$lsn$,
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
    $lsn$p2-m5-36-conditional-access$lsn$,
    (
        select m.id
        from public.topics m
        join public.topics d on m.parent_id = d.id
        where d.title = $lsn$Describe Azure architecture and services$lsn$
          and m.title = $lsn$Describe Azure identity, access, and security$lsn$
    ),
    4,
    $lsn$Describe Azure conditional access$lsn$,
    $lsn$Microsoft Entra Conditional Access evaluates sign-in signals and applies access decisions according to configured policies. Signals can include the user, application, location, device state, and risk, while policy actions can require MFA, require an approved or compliant device, restrict access, or block a sign-in. Conditional Access is an access-decision layer that operates with identity and authentication, not a replacement for role permissions on Azure resources. Actual available policy conditions and licensing requirements should be checked in current Microsoft documentation.$lsn$,
    $lsn$[{"term":"Conditional Access","definition":"A policy-based system that evaluates sign-in context and enforces access requirements."},{"term":"Sign-in signal","definition":"Context used to evaluate an access decision, such as user, device, location, or risk."},{"term":"Compliant device","definition":"A device assessed as meeting configured organizational requirements."}]$lsn$::jsonb,
    $lsn$A Kenyan fintech could require MFA for privileged administrators and block access to sensitive applications from devices that fail the organization’s requirements.$lsn$,
    $lsn$High-value topic. Questions tend to describe a condition and desired sign-in response.$lsn$,
    $lsn$confusing Conditional Access with Azure RBAC, which grants actions on resources.$lsn$,
    $lsn$Conditional Access asks “under what sign-in conditions?”; RBAC asks “which operations on which resources?$lsn$,
    $lsn$[{"q":"Give one example of a Conditional Access condition and one possible response.","a":"Example: unfamiliar sign-in context or device state can trigger an MFA requirement or block, according to policy."},{"q":"Does Conditional Access assign the Reader or Contributor role to an Azure resource?","a":"No. Azure RBAC assigns resource permissions; Conditional Access evaluates sign-in context and applies access requirements."}]$lsn$::jsonb,
    $lsn$https://learn.microsoft.com/en-us/training/modules/describe-azure-identity-access-security/5-conditional-access$lsn$,
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
    $lsn$p2-m5-37-role-based-access-control$lsn$,
    (
        select m.id
        from public.topics m
        join public.topics d on m.parent_id = d.id
        where d.title = $lsn$Describe Azure architecture and services$lsn$
          and m.title = $lsn$Describe Azure identity, access, and security$lsn$
    ),
    5,
    $lsn$Describe Azure role-based access control$lsn$,
    $lsn$Azure role-based access control (RBAC) grants permissions by assigning a role to a security principal at a defined scope. The three core pieces are who receives access, what permissions the role contains, and where the role assignment applies. Scope can be broad or narrow, such as management group, subscription, resource group, or an individual resource, and access may be inherited from a higher scope. Least privilege means granting only the access required to complete the task; role definitions and scope should be reviewed before granting administration rights.$lsn$,
    $lsn$[{"term":"Azure RBAC","definition":"A system for managing who can perform which actions on Azure resources."},{"term":"Role assignment","definition":"A binding of a security principal to a role at a scope."},{"term":"Scope","definition":"The resource hierarchy boundary to which a role assignment applies."},{"term":"Least privilege","definition":"Granting only the permissions required for a task."}]$lsn$::jsonb,
    $lsn$A KukuFiti team might give an engineer Contributor access to a development resource group but limit production access to read-only monitoring, rather than granting subscription-wide Owner rights to everyone.$lsn$,
    $lsn$Very high exam relevance. Remember principal + role + scope.$lsn$,
    $lsn$confusing a role with a user, or assuming Contributor can grant access to others just like Owner.$lsn$,
    $lsn$who, what, where; least privilege controls scope and permissions.$lsn$,
    $lsn$[{"q":"What are the three parts of an Azure RBAC role assignment?","a":"Security principal, role definition, and scope."},{"q":"Why is resource-group scope often safer than subscription-wide scope for a narrowly scoped task?","a":"It limits the assignment to the resources needed for the task, reducing excess privileges and unintended impact."}]$lsn$::jsonb,
    $lsn$https://learn.microsoft.com/en-us/training/modules/describe-azure-identity-access-security/6-role-based-access-control$lsn$,
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
    $lsn$p2-m5-38-zero-trust-model$lsn$,
    (
        select m.id
        from public.topics m
        join public.topics d on m.parent_id = d.id
        where d.title = $lsn$Describe Azure architecture and services$lsn$
          and m.title = $lsn$Describe Azure identity, access, and security$lsn$
    ),
    6,
    $lsn$Describe Zero Trust model$lsn$,
    $lsn$Zero Trust is a security approach that does not assume a request is trustworthy merely because it originates inside a network or from a previously known device. It emphasizes verifying explicitly, using least-privilege access, and assuming breach when designing detection and containment. It applies across identities, devices, networks, applications, and data rather than depending on one perimeter firewall. Zero Trust is a strategy and set of principles, not a single Azure product that automatically makes an environment secure.$lsn$,
    $lsn$[{"term":"Zero Trust","definition":"A security model that continuously evaluates access and does not grant implicit trust based on network location."},{"term":"Verify explicitly","definition":"Make access decisions using relevant identity and context signals."},{"term":"Assume breach","definition":"Design for detecting, limiting, and recovering from compromise."},{"term":"Least privilege","definition":"Restrict permissions to what is required."}]$lsn$::jsonb,
    $lsn$A Nairobi fintech can require strong staff authentication, evaluate device compliance, restrict production roles, and log sensitive operations even when the request comes from the company network.$lsn$,
    $lsn$Exam questions often ask for the guiding principles.$lsn$,
    $lsn$equating Zero Trust with “block all external traffic” or one firewall product.$lsn$,
    $lsn$verify explicitly; least privilege; assume breach.$lsn$,
    $lsn$[{"q":"Name the three commonly emphasized Zero Trust principles.","a":"Verify explicitly, use least privilege, and assume breach."},{"q":"Why does being connected to the corporate network not automatically make a request trusted?","a":"A compromised device or account may already be inside the network; access should be evaluated using identity and context rather than location alone."}]$lsn$::jsonb,
    $lsn$https://learn.microsoft.com/en-us/training/modules/describe-azure-identity-access-security/7-describe-zero-trust-model$lsn$,
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
    $lsn$p2-m5-39-defense-in-depth$lsn$,
    (
        select m.id
        from public.topics m
        join public.topics d on m.parent_id = d.id
        where d.title = $lsn$Describe Azure architecture and services$lsn$
          and m.title = $lsn$Describe Azure identity, access, and security$lsn$
    ),
    7,
    $lsn$Describe defense-in-depth$lsn$,
    $lsn$Defense in depth uses multiple complementary layers of controls so that the failure of one safeguard does not expose the entire workload. Layers can include physical security, identity and access, perimeter and network controls, compute protection, application security, and data protection. For example, encryption helps protect data, RBAC limits actions, network controls restrict paths, and monitoring helps detect suspicious activity. No single layer is sufficient, and the specific layers should be selected according to the system’s threats and requirements.$lsn$,
    $lsn$[{"term":"Defense in depth","definition":"A layered security strategy that uses multiple controls across a system."},{"term":"Security layer","definition":"A category of controls that protects a distinct part of a system or attack path."},{"term":"Data protection","definition":"Controls that protect information against unauthorized access, loss, or disclosure."}]$lsn$::jsonb,
    $lsn$A Kenyan fintech’s Azure-hosted API can combine Entra ID authentication, RBAC, NSGs/private connectivity, application validation, encryption, backups, and monitoring rather than relying on only one perimeter control.$lsn$,
    $lsn$The exam tests the idea of overlapping safeguards and may ask which layer addresses a threat.$lsn$,
    $lsn$assuming defense in depth means repeating the same firewall rule several times.$lsn$,
    $lsn$multiple different layers, each limiting a different failure or attack path.$lsn$,
    $lsn$[{"q":"What is the main purpose of defense in depth?","a":"To reduce the chance that one failed or bypassed control leads to compromise of the whole system."},{"q":"Name three distinct security layers that could protect a cloud-hosted API.","a":"Examples include identity/access, network controls, application security, compute/endpoint protection, encryption/data controls, physical security, and monitoring."}]$lsn$::jsonb,
    $lsn$https://learn.microsoft.com/en-us/training/modules/describe-azure-identity-access-security/8-describe-defense-depth$lsn$,
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
    $lsn$p2-m5-40-encryption-and-key-management-in-azure$lsn$,
    (
        select m.id
        from public.topics m
        join public.topics d on m.parent_id = d.id
        where d.title = $lsn$Describe Azure architecture and services$lsn$
          and m.title = $lsn$Describe Azure identity, access, and security$lsn$
    ),
    8,
    $lsn$Describe encryption and key management in Azure$lsn$,
    $lsn$Encryption transforms readable data into ciphertext so that unauthorized parties without the required key cannot readily read it. Data can be protected at rest in storage and in transit across network connections; the exact protection and responsibility depend on the service and configuration. Azure Key Vault provides managed capabilities for protecting and controlling access to secrets, cryptographic keys, and certificates. Encryption does not replace authentication, authorization, backup, or correct key access management; verify the current service documentation for each service’s specific encryption defaults and options.$lsn$,
    $lsn$[{"term":"Encryption at rest","definition":"Protection applied to stored data."},{"term":"Encryption in transit","definition":"Protection applied to data while moving across a network."},{"term":"Cryptographic key","definition":"A value used by a cryptographic algorithm to encrypt, decrypt, sign, or verify data."},{"term":"Azure Key Vault","definition":"A service for securely storing and controlling access to secrets, keys, and certificates."}]$lsn$::jsonb,
    $lsn$A Kenyan fintech can use TLS to protect API traffic and Azure Key Vault to manage secrets and cryptographic keys for services that integrate with it, while separately enforcing least-privilege access.$lsn$,
    $lsn$Exam questions often distinguish the data state being protected and what Key Vault manages.$lsn$,
    $lsn$assuming encryption alone decides who can log in or that Key Vault is a database for application records.$lsn$,
    $lsn$at rest is stored; in transit is moving; Key Vault governs secrets/keys/certificates.$lsn$,
    $lsn$[{"q":"What is the difference between encryption at rest and encryption in transit?","a":"At rest protects stored data; in transit protects data as it moves across a connection."},{"q":"Name three types of sensitive material Azure Key Vault can manage.","a":"Secrets, cryptographic keys, and certificates."}]$lsn$::jsonb,
    $lsn$https://learn.microsoft.com/en-us/training/modules/describe-azure-identity-access-security/9a-describe-encryption-key-management$lsn$,
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
    $lsn$p2-m5-41-microsoft-defender-for-cloud$lsn$,
    (
        select m.id
        from public.topics m
        join public.topics d on m.parent_id = d.id
        where d.title = $lsn$Describe Azure architecture and services$lsn$
          and m.title = $lsn$Describe Azure identity, access, and security$lsn$
    ),
    9,
    $lsn$Describe Microsoft Defender for Cloud$lsn$,
    $lsn$Microsoft Defender for Cloud helps assess cloud security posture and provides security capabilities for supported workloads. It can highlight recommendations and risks, support prioritization, and provide workload-protection capabilities depending on the services and plans enabled. It is not a replacement for identity design, application security, patching, or incident response; it helps teams discover and manage security work. Current capabilities, supported resources, and plan requirements can change, so confirm details in Microsoft documentation.$lsn$,
    $lsn$[{"term":"Microsoft Defender for Cloud","definition":"An Azure security service for posture assessment and supported workload-protection capabilities."},{"term":"Security posture","definition":"A view of an environment’s configuration and exposure relative to security recommendations or controls."},{"term":"Security recommendation","definition":"A suggested action to reduce a detected risk or improve configuration."}]$lsn$::jsonb,
    $lsn$A Kenyan agritech company can review Defender for Cloud recommendations for its Azure resources and prioritize exposed services or weak configurations alongside its own secure coding, patching, and access reviews.$lsn$,
    $lsn$The exam tests the purpose of the service, not detailed pricing or every plan feature.$lsn$,
    $lsn$confusing Defender for Cloud with Azure Monitor or assuming it automatically fixes every finding.$lsn$,
    $lsn$assess posture, recommend improvements, protect supported workloads.$lsn$,
    $lsn$[{"q":"What kind of visibility or guidance does Defender for Cloud provide?","a":"It assesses security posture and surfaces recommendations and supported workload-protection capabilities."},{"q":"Does enabling Defender for Cloud remove the need for secure coding and access control?","a":"No. It complements—not replaces—secure design, correct permissions, patching, monitoring, and incident response."}]$lsn$::jsonb,
    $lsn$https://learn.microsoft.com/en-us/training/modules/describe-azure-identity-access-security/9-describe-microsoft-defender-for-cloud$lsn$,
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

-- Backfill questions.lesson_id for Path 2
update public.questions q
set lesson_id = l.id
from public.lessons l
where q.skill_ref = l.source_url
  and q.lesson_id is distinct from l.id;
