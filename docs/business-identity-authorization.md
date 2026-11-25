# Business identity authorization

Martin Mukoya and FlexTech Media share one administrative workspace. An authenticated `ADMIN` can administer both identities using the same session. A site or issuer selection filters records and chooses branding and defaults. A document ID or selected site alone grants no access. `createdById` records who acted.

| Request | Authorization | Identity rule |
| --- | --- | --- |
| Admin pages and direct document, lead, customer, booking, template, and payment APIs | A valid `ADMIN` session. Admin APIs return `401` without a session and `403` for other roles. | Admins can work with either identity. Record IDs determine the resource. A site filter does not override its stored identity. |
| Admin business or financial PDF by ID | Same admin guard as the other direct-ID routes. | Render from the loaded document and its issuer data. Admin PDF responses are private and non-cacheable. |
| Public shared preview, data, PDF, accept, and decline | A valid enabled share credential for one eligible document. | The link resolves to its associated document. Revocation, expiry and document state are checked before serving it or applying a response. Accept and decline also enforce their own document-state rules. |

Contacts and business-document templates are shared across the workspace. A template must match the business document category. A project can be assigned to both sites, and a project with no site assignments is shared. Legacy leads with no site can be used in a business document, but must have a site before conversion to a financial booking.

Business document creation, draft editing, and issuance check the effective identity against the selected or retained lead, project memberships, and linked financial document. A linked lead with a site and a linked financial document must agree with the document identity. A site-assigned project must include that identity. An issued business document uses its issuer snapshot. Older business documents without a snapshot use their site settings.

Bookings must agree with their linked lead’s site. A lead’s site cannot change once a booking or business document references it. A lead with only a project link may move to another site covered by that project. A financial draft inherits its booking’s site and cannot move to a different booking during editing. Conversions and revisions preserve the source booking and issuer provenance.

Route tests cover absent and non-admin sessions, allowed direct-ID reads, edits and PDF requests across both identities, rejected cross-identity associations, and public share eligibility. These are application-level authorization rules. The database API has its own grants and row-level policies.
