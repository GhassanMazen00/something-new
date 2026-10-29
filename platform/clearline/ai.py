"""The AI slot, kept empty for now.

When it is switched on, Claude will help with three jobs and nothing else: reading PDF statements into tables,
suggesting column matches the rules can't settle, and drafting the plain-language summary for the analyst to edit.
The numbers always come from the models in `engine`, never from the AI. Client data will only be sent under a
zero-retention agreement, from a secure server, and every call will be written to the activity log.
"""

from . import config


def status() -> dict:
    return {
        'enabled': config.AI_ENABLED,
        'jobs': ['Read PDF bank statements and invoices', 'Suggest column matches', 'Draft the report summary'],
        'note': 'Off. The models run without it; this slot is ready for when it is connected.',
    }


def draft_summary(report: dict) -> str:
    raise NotImplementedError('The AI step is not connected yet.')
