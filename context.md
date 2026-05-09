# Project Context: MEC3D Platform

## 1. Project Vision & Objective

[cite_start]MEC3D is a specialized ecosystem designed to connect mechanical designers, manufacturers, and buyers to solve the global shortage of discontinued or hard-to-find mechanical parts[cite: 42, 43, 44]. [cite_start]The platform empowers independent designers and manufacturers to monetize their CAD skills and industrial equipment (3D printing, CNC)[cite: 44, 98].

## 2. Core Business Modalities

The frontend must support four distinct commercial flows:

- [cite_start]**Design:** Designers upload CAD files (STL, 3MF, CNC) and set a download price[cite: 68, 70, 76].
- [cite_start]**Fabrication:** Buyers request custom manufacturing from local providers based on a selected platform design[cite: 48, 89].
- [cite_start]**Venta Directa (Direct Sale):** Sale of pre-fabricated, tested physical parts[cite: 24, 105].
- [cite_start]**Planos (Plans):** Technical blueprints sold for a one-time fee, typically for external manufacturing[cite: 7, 21].

## 3. The Mandatory 3-Tier Quoting System

[cite_start]For the **Fabrication** modality, the interface must enforce a rigid tri-level pricing structure for manufacturers based on technical quality[cite: 53, 54, 92]:

| Quality Tier       | Infill %                    | Layer Height                  | Suggested Materials         |
| :----------------- | :-------------------------- | :---------------------------- | :-------------------------- |
| **Low (Baja)**     | [cite_start]15% [cite: 55]  | [cite_start]0.30mm [cite: 55] | [cite_start]PLA [cite: 54]  |
| **Medium (Media)** | [cite_start]50% [cite: 55]  | [cite_start]0.20mm [cite: 55] | [cite_start]PETG [cite: 54] |
| **High (Alta)**    | [cite_start]100% [cite: 55] | [cite_start]0.10mm [cite: 55] | [cite_start]ASA [cite: 54]  |

**Timing Constraints:**

- [cite_start]**Quote Validity:** Manufacturer quotes must expire after 48 hours[cite: 57, 84, 85].
- [cite_start]**Manufacturing Deadline:** Once accepted, parts must be fabricated within 10 business days[cite: 58, 86].

## 4. Design Integrity & Financial Logic

- [cite_start]**Design-to-Part Link:** Every physical piece sold must be linked to a unique internal design code registered on the platform[cite: 4, 6, 64].
- [cite_start]**Designer Royalties:** The system must automatically calculate a **3% commission** for the original designer whenever a third-party manufacturer sells a piece based on that design[cite: 31, 32, 82].
- [cite_start]**Plagiarism Protection:** The first user to upload a design has price priority; identical designs uploaded later must be priced higher by the system[cite: 71, 78, 79].

## 5. Escrow & Security (Seguro Comprador)

- [cite_start]**Payment Holding:** The platform retains the buyer's money until both parties confirm successful delivery[cite: 11, 31, 49, 94].
- [cite_start]**Funds Release:** Payments are released to the seller only after mutual confirmation[cite: 11, 31, 60, 86].
- [cite_start]**Chat System:** A private chat between buyer and seller is only enabled AFTER a payment has been successfully made[cite: 35, 36, 62, 63].

## 6. UX & Categorization Guidelines

- [cite_start]**Technical Focus:** Search logic must prioritize specific part numbers and mechanical keywords over generic terms[cite: 79, 102].
- [cite_start]**Core Categories:** Autos, Motos, Barcos, Casa, Maquinas, and Engranajes[cite: 81, 101, 108].
- [cite_start]**The "Anti-Industrial" Rule:** The platform explicitly prohibits the sale of mass-produced hardware (e.g., standard screws, nails) or used/resale items[cite: 40, 41, 101, 107].
- [cite_start]**Reputation:** Users are evaluated via a scoring system; low scores can lead to expulsion[cite: 11, 12, 69, 75].
