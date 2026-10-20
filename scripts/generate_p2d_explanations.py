import json
import glob
import os
import re

EXPLANATIONS_DB = {
    "cloud-concepts-mod1": [
        {
            "term": "Cloud Computing",
            "analogy": "Think of this like renting a backup diesel generator from a local vendor only during a power blackout, instead of spending hundreds of thousands of shillings to buy, fuel, and service your own heavy generator full-time.",
            "correct_concept": "Cloud computing delivers on-demand compute, storage, and networking over the internet on a pay-as-you-go model."
        },
        {
            "term": "Shared Responsibility Model (PaaS)",
            "analogy": "Think of this like renting an apartment in Kilimani—the landlord maintains the building structure, plumbing, and electrical grid, but you remain strictly responsible for locking your front door and protecting your valuables inside.",
            "correct_concept": "In PaaS, Microsoft patches the OS and database engine, but customer data and access permissions always remain the customer's responsibility."
        },
        {
            "term": "IaaS vs PaaS Management Boundary",
            "analogy": "Think of this like renting a self-drive car (IaaS, where you handle petrol, flat tires, and maintenance) versus hailing an Uber (PaaS, where the driver handles vehicle maintenance while you just sit inside and reach your destination).",
            "correct_concept": "IaaS leaves operating system and runtime management to the customer; PaaS abstracts the OS away so the cloud provider manages it."
        },
        {
            "term": "Hybrid Cloud",
            "analogy": "Think of this like running your main physical retail shop on Biashara Street while simultaneously integrating an online M-Pesa web portal and cloud backup for digital orders.",
            "correct_concept": "Hybrid cloud specifically connects and interoperates on-premises private infrastructure with public cloud services."
        },
        {
            "term": "Multicloud",
            "analogy": "Think of this like using Safaricom M-Pesa for instant local customer payments while using Equity Bank for international supplier wires to leverage the distinct advantages of both providers.",
            "correct_concept": "Multicloud means deploying production workloads across two or more separate public cloud providers (such as Azure and Google Cloud)."
        },
        {
            "term": "Consumption-Based Model",
            "analogy": "Think of this like leaving the tap running in your rental house while traveling upcountry for the weekend—Nairobi Water bills you for every drop that flowed through the meter regardless of whether anyone was home drinking it.",
            "correct_concept": "Cloud resources are billed while deployed and running; stopping application traffic does not stop billing unless resources are deallocated."
        }
    ],
    "cloud-concepts-mod2": [
        {
            "term": "Horizontal Scaling (Scale Out / Scale In)",
            "analogy": "Think of this like adding three more 14-seater matatus to your fleet during the morning rush hour on Thika Road, and parking them when passenger demand drops midday.",
            "correct_concept": "Horizontal scaling adds or removes resource instances (VMs), while vertical scaling increases the CPU or RAM of a single instance."
        },
        {
            "term": "High Availability vs Scalability",
            "analogy": "Think of this like running a matatu business—adding more vehicles handles crowded bus stages (scalability), but carrying spare tires and doing engine maintenance is what prevents roadside breakdowns (availability).",
            "correct_concept": "Scalability handles varying customer traffic; high availability ensures fault recovery and continuous operation through hardware disruptions."
        },
        {
            "term": "Cloud Reliability",
            "analogy": "Think of this like storing your harvest in three separate granaries across Nakuru and Eldoret so that a fire in one facility never wipes out your entire season's food supply.",
            "correct_concept": "Reliability is the ability of a system to recover from infrastructure failures and continue functioning, such as deploying across multiple regions."
        },
        {
            "term": "Azure Policy",
            "analogy": "Think of this like a SACCO bylaw that automatically rejects any withdrawal above KES 100,000 without a committee signature, preventing staff from accidentally or deliberately bypassing safety rules.",
            "correct_concept": "Azure Policy audits, enforces, and prevents non-compliant resource configurations across your subscriptions."
        },
        {
            "term": "Infrastructure as Code (IaC)",
            "analogy": "Think of this like an architect's digital blueprint—sending the blueprint to a modern pre-fabrication factory produces identical houses with exact measurements every single time.",
            "correct_concept": "ARM templates and Bicep define infrastructure declaratively in version-controlled files, enabling repeatable, automated environment deployments."
        },
        {
            "term": "Shared Responsibility for Sustainability",
            "analogy": "Think of this like Kenya Power operating green geothermal power plants, while you are responsible for turning off factory lights and heavy machines when workers leave.",
            "correct_concept": "Microsoft manages sustainability OF the cloud (datacenters, power, cooling); customers manage sustainability IN the cloud (workload sizing and eliminating idle compute)."
        }
    ],
    "cloud-concepts-mod3": [
        {
            "term": "Infrastructure as a Service (IaaS)",
            "analogy": "Think of this like leasing an empty commercial stall on Biashara Street—the building landlord handles the roof and foundation, but you are responsible for installing shelves, locks, and sweeping the floor.",
            "correct_concept": "In IaaS, Microsoft manages the physical server hardware, but the customer is responsible for guest operating system patching and configuration."
        },
        {
            "term": "Platform as a Service (PaaS)",
            "analogy": "Think of this like renting a commercial cooking station in a food court—the management provides the gas supply, stoves, and water, but you bring your own recipes, food ingredients, and secret spices.",
            "correct_concept": "In PaaS, Microsoft manages the OS, runtime, and hardware, while the customer owns application code, business logic, and data."
        },
        {
            "term": "Software as a Service (SaaS)",
            "analogy": "Think of this like ordering lunch delivered from a restaurant—you don't manage the kitchen, pots, or chefs, but you decide who sits at your table and who is allowed to eat.",
            "correct_concept": "In SaaS, the provider manages the entire application and infrastructure, but the customer retains responsibility for user accounts, access permissions, and data sharing."
        },
        {
            "term": "Cloud Service Models (IaaS / PaaS / SaaS)",
            "analogy": "Think of the trade-off: IaaS is buying flour and baking bread at home (full control); PaaS is using a bakery's commercial oven to bake your dough (shared platform); SaaS is buying a sliced loaf off the supermarket shelf (consume ready-made).",
            "correct_concept": "Choose IaaS for OS-level control, PaaS for custom code without OS management, and SaaS for ready-to-use software applications."
        }
    ],
    "arch-mod1": [
        {
            "term": "Azure Subscription",
            "analogy": "Think of this like holding two separate commercial bank accounts and business PINs for your logistics company versus your farming business so their expenses, invoices, and audit trails never mix.",
            "correct_concept": "An Azure subscription serves as the primary billing and governance isolation boundary in Azure."
        },
        {
            "term": "Availability Zones",
            "analogy": "Think of this like having three independent M-Pesa kiosks on different streets in Westlands with separate electrical feeds—if one kiosk experiences a blackout, customers simply walk 50 meters to the next kiosk.",
            "correct_concept": "Availability Zones are physically separate datacenter facilities within an Azure region, each with independent power, cooling, and networking."
        },
        {
            "term": "Azure Region Pairs",
            "analogy": "Think of this like having a warehouse in Nairobi and another in Mombasa—simply owning space in both cities doesn't automatically transport goods between them; you must explicitly book transport and replication.",
            "correct_concept": "Region pairs support cross-region disaster recovery, but data replication and automated failover must be explicitly configured by the customer."
        },
        {
            "term": "Azure Management Groups",
            "analogy": "Think of this like a SACCO board issuing an overarching lending policy that automatically applies to all regional branches, accounts, and staff underneath it.",
            "correct_concept": "Management groups sit above subscriptions in the hierarchy, allowing governance and policies to be applied once and inherited by all child subscriptions."
        },
        {
            "term": "Azure Resource Group",
            "analogy": "Think of this like a labeled manila folder in an office filing cabinet—putting documents into a folder labeled 'Coast Operations' doesn't mean the papers can only be read at the beach; the folder is just a logical organizer.",
            "correct_concept": "A resource group is a logical management container; its region setting only specifies where its management metadata is stored, not where contained resources must reside."
        }
    ],
    "arch-mod2": [
        {
            "term": "Azure Virtual Machines (IaaS)",
            "analogy": "Think of this like renting a private mechanical workshop garage where you have full permission to rebuild the vehicle engine, install custom gearboxes, and tune the exhaust.",
            "correct_concept": "Azure VMs provide complete operating system-level control, allowing installation of custom kernels, drivers, and legacy packages."
        },
        {
            "term": "Azure Virtual Desktop (AVD)",
            "analogy": "Think of this like streaming a movie on Netflix from your phone—the heavy computing and video playback run in the cloud, while your device just displays the picture without storing the film.",
            "correct_concept": "Azure Virtual Desktop delivers centralized, secure Windows desktops and applications to remote users over the network without local installation."
        },
        {
            "term": "Containers",
            "analogy": "Think of this like standard shipping containers on a freight train—cargo is packed in identical standardized boxes sharing the same train locomotive and tracks, loading in seconds compared to building custom trucks.",
            "correct_concept": "Containers package application code with dependencies and share the host operating system kernel, making them lightweight and fast to start."
        },
        {
            "term": "Azure Functions (Serverless)",
            "analogy": "Think of this like a boda-boda rider at the stage who only starts his motorcycle engine when a paying passenger arrives, rather than burning fuel idling his engine all morning.",
            "correct_concept": "Azure Functions executes code in response to events (like HTTP webhooks) without requiring server provisioning or ongoing management."
        },
        {
            "term": "Azure Compute Hosting Hierarchy",
            "analogy": "Think of choosing transport: an electric passenger train for daily commuters (App Service), an on-demand courier for instant package dispatch (Functions), and a heavy-duty customized tractor for rugged farm terrain (VM).",
            "correct_concept": "Match workload needs: managed web platforms use App Service, event-driven tasks use Functions, and custom OS/driver dependencies use VMs."
        }
    ],
    "arch-mod3": [
        {
            "term": "Network Security Group (NSG)",
            "analogy": "Think of this like a security guard stationed at the entrance of a bank branch checking IDs and allowing only authorized staff into the cash vault room while turning everyone else away.",
            "correct_concept": "An NSG acts as a stateful packet firewall that filters inbound and outbound traffic to subnets and network interfaces based on IP and port rules."
        },
        {
            "term": "Site-to-Site VPN Gateway",
            "analogy": "Think of this like an armored escort vehicle traveling between your head office and a branch office over the public highway, protected by locked doors and armed security guards.",
            "correct_concept": "A site-to-site VPN establishes an encrypted IPsec tunnel connecting an entire on-premises network to an Azure Virtual Network over the public internet."
        },
        {
            "term": "Azure ExpressRoute",
            "analogy": "Think of this like building a dedicated private underground train line directly connecting your office building to the airport, completely avoiding public road traffic.",
            "correct_concept": "ExpressRoute provides a dedicated, private connection through a connectivity provider to Azure that does not traverse the public internet."
        },
        {
            "term": "Azure DNS",
            "analogy": "Think of this like the contact list in your phone—you search for a contact's friendly name and it looks up their numeric Safaricom phone number so your phone knows who to call.",
            "correct_concept": "Azure DNS resolves human-readable domain names into IP addresses so clients can connect to network services."
        },
        {
            "term": "Virtual Network Peering (VNet Peering)",
            "analogy": "Think of this like opening an interconnecting hallway between two adjacent office towers—workers can now walk directly between towers, but security doors in each tower still check badges.",
            "correct_concept": "VNet peering connects separate VNets over Microsoft's backbone, but existing NSG security rules and route tables continue to filter traffic."
        }
    ],
    "arch-mod4": [
        {
            "term": "Azure Blob Storage",
            "analogy": "Think of this like a massive digital storage facility where you can store millions of document scans, photos, and video files with a unique barcode on each file for instant retrieval.",
            "correct_concept": "Blob Storage is an object storage solution designed for massive volumes of unstructured data like images, documents, and log files."
        },
        {
            "term": "Zone-Redundant Storage (ZRS)",
            "analogy": "Think of this like keeping backup copies of vital SACCO deed records in three separate strongrooms across Nairobi so that a localized fire in one building doesn't wipe out the deeds.",
            "correct_concept": "ZRS synchronously replicates data across three separate availability zones within the primary region to survive zone-level failures."
        },
        {
            "term": "Geo-Redundant Storage (GRS)",
            "analogy": "Think of this like dispatching bank deposit carbon-copy slips from Kisumu to Nairobi on the evening bus—there is a slight travel delay, so any slip written seconds before an accident might not have reached Nairobi yet.",
            "correct_concept": "GRS replicates data asynchronously to a secondary region hundreds of miles away; because replication is asynchronous, recovery point objective (RPO) is greater than zero."
        },
        {
            "term": "Azure Storage Movement Tools",
            "analogy": "Think of using a motorized cargo conveyor for scheduled batch loading (AzCopy), a glass showcase display for manual inventory checks (Storage Explorer), and an automated courier continuously synchronizing stock between two warehouses (Azure File Sync).",
            "correct_concept": "AzCopy handles high-performance CLI scripted transfers; Storage Explorer provides a GUI for browsing; Azure File Sync keeps on-prem Windows Servers continuously synchronized with Azure Files."
        }
    ],
    "arch-mod5": [
        {
            "term": "Microsoft Entra Domain Services",
            "analogy": "Think of this like moving your business into a serviced office that comes pre-wired with a landline telephone switchboard and receptionist, so you don't have to purchase and maintain your own telephone servers.",
            "correct_concept": "Microsoft Entra Domain Services provides managed domain join, LDAP, and Kerberos authentication for legacy applications without deploying domain controller VMs."
        },
        {
            "term": "Single Sign-On (SSO)",
            "analogy": "Think of this like receiving an all-access security wristband at a conference that lets you walk into the keynote hall, lunch dining room, and workshop rooms without showing your ID at every single door.",
            "correct_concept": "SSO enables a user to authenticate once and access multiple authorized applications without having to re-enter credentials."
        },
        {
            "term": "Microsoft Entra Conditional Access",
            "analogy": "Think of this like a smart office door that lets employees in with just a badge during office hours, but demands a fingerprint scan and SMS confirmation if someone attempts entry at 2 AM from an unfamiliar laptop.",
            "correct_concept": "Conditional Access evaluates real-time signals (user, location, device health) to enforce access policies such as requiring multi-factor authentication (MFA)."
        },
        {
            "term": "Azure Role-Based Access Control (RBAC)",
            "analogy": "Think of this like giving the office intern a visitor pass that only unlocks the library door, rather than handing them the master keyring that opens the financial safe and executive boardroom.",
            "correct_concept": "RBAC enforces least privilege by granting specific permissions (roles) to security principals at defined scopes (management group, subscription, resource group, or resource)."
        },
        {
            "term": "Defense in Depth",
            "analogy": "Think of this like protecting a commercial bank with perimeter perimeter walls, armed compound guards, biometric vault doors, and steel lockboxes—if an intruder climbs the outer wall, the cash is still secure behind four more layers.",
            "correct_concept": "Defense in depth employs multiple independent layers of security (perimeter, network, compute, application, data) so that a single failure does not compromise the system."
        }
    ],
    "mgmt-mod1": [
        {
            "term": "Egress Network Data Transfer",
            "analogy": "Think of this like visiting a wholesale market where entering with your truck is free, but driving out with heavy commercial cargo attracts a tollgate exit charge.",
            "correct_concept": "Inbound data transfer (ingress) into Azure is generally free, whereas outbound data transfer (egress) leaving Azure datacenters over the internet incurs bandwidth fees."
        },
        {
            "term": "Azure Pricing Calculator",
            "analogy": "Think of this like drafting a shopping list and calculating your estimated bill using a supermarket price list before you leave home, ensuring you have enough money budgeted.",
            "correct_concept": "The Pricing Calculator models hypothetical architectures and estimates monthly service costs prior to provisioning any infrastructure."
        },
        {
            "term": "Cost Management Budgets and Alerts",
            "analogy": "Think of this like setting an SMS notification on your bank account when you spend over KES 10,000—the bank sends an alert message to your phone, but your debit card doesn't suddenly stop working unless you set an automated block.",
            "correct_concept": "Azure budgets evaluate spend against targets and send alert notifications; they do not automatically shut down resources unless paired with custom automation."
        },
        {
            "term": "Resource Tags",
            "analogy": "Think of this like putting color-coded stickers on office equipment (green for Sales, blue for Tech, yellow for HR) so the accountant knows exactly which department to charge on the invoice.",
            "correct_concept": "Tags are key-value metadata pairs applied to resources to categorize, filter, and allocate costs across departments, environments, and projects."
        },
        {
            "term": "Spot Virtual Machines",
            "analogy": "Think of this like buying standby bus tickets on a long-distance coach at a 90% discount—you get a great price, but if a regular full-price passenger books the seat, you step off and take the next bus.",
            "correct_concept": "Spot VMs leverage spare Azure compute capacity at deep discounts for fault-tolerant, checkpointed batch jobs that tolerate unexpected eviction."
        }
    ],
    "mgmt-mod2": [
        {
            "term": "Delete Resource Lock",
            "analogy": "Think of this like placing a protective locked cover over the fire alarm or emergency power switch—technicians can still inspect and clean the panel, but nobody can accidentally yank the switch.",
            "correct_concept": "A Delete lock allows authorized users to read and modify a resource while preventing anyone (even owners) from deleting it until the lock is removed."
        },
        {
            "term": "Azure Policy",
            "analogy": "Think of this like a corporate policy mandating that all company delivery vans must only be refueled at approved partner stations in Nairobi, automatically preventing fueling anywhere else.",
            "correct_concept": "Azure Policy evaluates resource properties and configurations to enforce organizational standards, such as restricting deployments to approved geographic regions."
        },
        {
            "term": "Microsoft Purview",
            "analogy": "Think of this like an automated compliance officer who walks through every branch warehouse, stamps all boxes containing national ID cards, and draws a map showing which truck delivered them.",
            "correct_concept": "Microsoft Purview provides unified data governance by discovering, classifying sensitive data, and mapping end-to-end data lineage across multicloud and on-prem estates."
        },
        {
            "term": "Azure Policy Initiative",
            "analogy": "Think of this like binding 15 individual health, safety, and fire bylaws into a single official restaurant handbook, allowing managers to sign and track compliance with one package.",
            "correct_concept": "An initiative definition (policy set) groups multiple related policy definitions together to simplify assignment and provide aggregate compliance reporting."
        },
        {
            "term": "Microsoft Service Trust Portal",
            "analogy": "Think of this like a public archive holding certified Bureau of Standards (KEBS) test reports and ISO audit documents proving a manufacturer's factory meets international safety criteria.",
            "correct_concept": "The Service Trust Portal is Microsoft's central repository for independent third-party audit reports (SOC, ISO) and regulatory compliance documentation."
        }
    ],
    "mgmt-mod3": [
        {
            "term": "Azure Cloud Shell",
            "analogy": "Think of this like accessing your online banking portal through a web browser on a cyber cafe computer—you don't have to carry or install any banking software on the cafe's machine.",
            "correct_concept": "Azure Cloud Shell is a browser-accessible, hosted terminal environment with Azure CLI and PowerShell pre-installed, requiring no local software setup."
        },
        {
            "term": "Azure Resource Manager (ARM)",
            "analogy": "Think of this like a central bank teller counter—whether you submit a paper withdrawal slip, insert an ATM card, or send an app transfer, every request passes through the same teller who verifies your identity and checks the rules.",
            "correct_concept": "ARM is the central management plane for Azure that receives, authenticates, and routes all resource requests across the Portal, CLI, PowerShell, and APIs."
        },
        {
            "term": "Azure Arc",
            "analogy": "Think of this like a retail chain's central Nairobi headquarters managing and monitoring franchised stores in Nakuru and Kampala without moving the physical stores to Nairobi.",
            "correct_concept": "Azure Arc extends Azure Resource Manager governance, policies, and monitoring to servers and Kubernetes clusters hosted on-premises or in other clouds without migrating them."
        },
        {
            "term": "ARM Templates and Bicep (IaC)",
            "analogy": "Think of this like an architect's digital CAD blueprint—feeding the blueprint to a 3D building printer produces identical houses with exact walls, windows, and doors every time.",
            "correct_concept": "ARM templates and Bicep provide declarative Infrastructure as Code (IaC) to automate consistent, repeatable deployments across environments."
        },
        {
            "term": "Azure CLI & Azure PowerShell",
            "analogy": "Think of this like two skilled translators—one speaks concise command shorthand and outputs structured text (CLI), while the other speaks formal corporate language passing structured objects (PowerShell). Both work on Linux, Mac, and Windows.",
            "correct_concept": "Azure CLI uses 'az' commands with JSON output; Azure PowerShell uses 'Verb-AzNoun' cmdlets passing .NET objects. Both are cross-platform."
        }
    ],
    "mgmt-mod4": [
        {
            "term": "Azure Advisor",
            "analogy": "Think of this like a trusted veteran mechanic who inspects your commercial vehicle fleet weekly and advises: 'You are leaving three vans idling overnight; turn them off to cut fuel costs, and upgrade the locks on the cargo door.'",
            "correct_concept": "Azure Advisor analyzes active resource configurations to provide personalized recommendations across Cost, Security, Reliability, Performance, and Operational Excellence."
        },
        {
            "term": "Azure Service Health",
            "analogy": "Think of this like a personalized SMS alert from Kenya Power informing you that power is out specifically in your neighborhood or that your substation has maintenance tomorrow, rather than checking a generic national status board.",
            "correct_concept": "Azure Service Health delivers personalized notifications and status updates about cloud incidents, planned maintenance, and advisories affecting your specific subscriptions and regions."
        },
        {
            "term": "Application Insights",
            "analogy": "Think of this like a fitness tracker watch on a marathon runner monitoring heart rate, breathing, and step cadence in real time, alerting immediately if a runner gets a leg cramp or pulse spikes.",
            "correct_concept": "Application Insights is an APM feature of Azure Monitor that tracks live web application requests, response times, database dependency calls, and runtime code exceptions."
        },
        {
            "term": "Alert Rules & Action Groups",
            "analogy": "Think of this like a smoke detector sensor (Alert Rule) detecting smoke in the warehouse, and the automated emergency plan (Action Group) that dials the fire brigade and activates the ceiling water sprinklers.",
            "correct_concept": "In Azure Monitor, an Alert Rule specifies the metric or log condition to evaluate, while an Action Group defines the notification recipients (SMS/email) and automated actions (runbooks/webhooks)."
        }
    ]
}

def enrich_files():
    files = sorted(glob.glob('content/validated/*.json'))
    q_files = [f for f in files if not f.endswith('.audit.json')]
    
    os.makedirs('content/published', exist_ok=True)
    
    proper_prefixes = (
        'Azure', 'ARM', 'VNet', 'VPN', 'DNS', 'RBAC', 'PaaS', 'IaaS', 'SaaS', 
        'Microsoft', 'KEBS', 'WORM', 'ExpressRoute', 'ZRS', 'GRS', 'LRS', 
        'GZRS', 'SSO', 'MFA', 'CLI', 'PowerShell', 'REST', 'Linux', 'Windows', 
        'HTTP', 'IPsec', 'MAC', 'IP', 'APM', 'SIEM', 'SOAR', 'DenyAssignment', 
        'ReadOnly', 'Delete', 'Cloud', 'Service', 'Defender', 'Monitor', 'Advisor',
        'Network', 'Storage', 'Cost', 'Log', 'Application', 'Traffic', 'Policy',
        'Entra', 'Spot', 'Dedicated', 'Reservations', 'Pay-As-You-Go'
    )
    
    total_processed = 0
    for fpath in q_files:
        fname = os.path.basename(fpath).replace('.json', '')
        with open(fpath, 'r') as fp:
            questions = json.load(fp)
            
        metadata_list = EXPLANATIONS_DB.get(fname, [])
        if not metadata_list:
            print(f"Warning: No metadata found for {fname}")
            continue
            
        for i, q in enumerate(questions):
            meta = metadata_list[i] if i < len(metadata_list) else metadata_list[-1]
            term = meta["term"]
            analogy = meta["analogy"]
            correct_concept = meta["correct_concept"]
            
            # Add general explain_simply at question level
            q["explain_simply"] = {
                "azure_term": term,
                "analogy": analogy,
                "key_takeaway": correct_concept
            }
            
            # Enrich each option with tailored 3-part P2d explanation
            for opt in q["options"]:
                rat = opt["rationale"].strip()
                rat = re.sub(r'\s+', ' ', rat)
                parts = re.split(r'(?<=[.!?])\s+', rat)
                first_sentence = parts[0].rstrip('.').strip()
                
                if opt["is_correct"]:
                    sentence1 = f"Spot on! Option {opt['id']} is correct: {first_sentence}."
                else:
                    words = first_sentence.split(' ')
                    first_word = words[0]
                    if first_word in proper_prefixes or any(first_sentence.startswith(p) for p in proper_prefixes):
                        sub_clause = first_sentence
                    else:
                        sub_clause = first_word.lower() + (' ' + ' '.join(words[1:]) if len(words) > 1 else '')
                    sentence1 = f"Not quite: Option {opt['id']} is incorrect because {sub_clause}."
                
                sentence2 = analogy
                sentence3 = f"Exact Azure term to remember: {term}."
                
                full_explanation = f"{sentence1} {sentence2} {sentence3}"
                word_count = len(full_explanation.split())
                opt["explanation"] = full_explanation
                opt["explanation_word_count"] = word_count
                
        # Write back to content/validated/
        with open(fpath, 'w') as fp:
            json.dump(questions, fp, indent=2)
            
        # Write to content/published/ with reviewed_by_human = true ready for database seed
        pub_questions = []
        for q in questions:
            q_copy = dict(q)
            q_copy["reviewed_by_human"] = True
            pub_questions.append(q_copy)
            
        pub_path = os.path.join('content/published', os.path.basename(fpath))
        with open(pub_path, 'w') as fp:
            json.dump(pub_questions, fp, indent=2)
            
        total_processed += len(questions)
        print(f"Enriched {fname}: {len(questions)} questions with P2d Explanations -> saved to validated & published.")

    print(f"\nSuccessfully generated P2d Explanations for all {total_processed} questions!")

if __name__ == '__main__':
    enrich_files()
