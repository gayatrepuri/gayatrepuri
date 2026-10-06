/**
 * Creates the Offscript student survey as a Google Form, plus a Google Sheet
 * that collects every response.
 *
 * HOW TO USE (5 minutes, no coding):
 *  1. Go to https://script.google.com and click "New project".
 *  2. Delete everything in the editor, paste this whole file in, and press Ctrl+S.
 *  3. At the top, make sure "createOffscriptSurvey" is selected, then click "Run".
 *  4. Google asks for permission: Review permissions → choose your account →
 *     "Advanced" → "Go to Untitled project (unsafe)" → Allow.
 *     (It says "unsafe" only because you wrote the script yourself and Google
 *     hasn't reviewed it. It only creates a form and a sheet in your own Drive.)
 *  5. When it finishes, open "Execution log" at the bottom. It shows three links:
 *     EDIT (to tweak the form), SHARE (send this to students) and RESPONSES (the sheet).
 *
 * Want to change a question? Edit the text below and run it again. It makes a
 * fresh form each time, so delete old copies from Google Drive.
 */

// Feature list, used in several questions so they always match.
const FEATURES = [
  'Coffee runs (quick coffee with someone nearby)',
  'Study sessions (library / café study buddies)',
  'Events & spare tickets',
  'Collabs (find people to work on projects with)',
  'Study participants wanted (recruit or take part in research)',
  'Conference buddies',
  'Rants (vent with people who get it)',
  'Polls',
  'AI matching with people who share your research or interests',
  'Fun profile questions (favourite place to cry, coffee order…)',
];

function createOffscriptSurvey() {
  const form = FormApp.create('Offscript: 3 quick minutes for academics');
  form
    .setDescription(
      'We are building Offscript, a free app for university students and researchers to meet each other ' +
        'for coffee, study sessions, events and collaborations.\n\n' +
        'Before we launch, we want honest answers, including "no thanks". It takes about 3 minutes. ' +
        'The survey is anonymous unless you choose to leave your email at the end. ' +
        'Answers are only used to shape Offscript and are never sold or shared.'
    )
    .setProgressBar(true)
    .setCollectEmail(false)
    .setAllowResponseEdits(false)
    .setShowLinkToRespondAgain(false)
    .setConfirmationMessage(
      'Thank you! ✿ Your answers genuinely shape what we build.\n\n' +
        'Want to be first in? Save your spot at https://offscriptapp.uk'
    );

  // ── Section 1: About you ─────────────────────────────────────────
  form.addSectionHeaderItem().setTitle('About you');

  form
    .addMultipleChoiceItem()
    .setTitle('Which best describes you?')
    .setChoiceValues(['Undergraduate', "Master's student", 'PhD student', 'Postdoc / researcher', 'University staff'])
    .showOtherOption(true)
    .setRequired(true);

  form
    .addTextItem()
    .setTitle('Which university are you at?')
    .setHelpText('e.g. UCL, King\'s, Cambridge…')
    .setRequired(true);

  form
    .addListItem()
    .setTitle('What area do you study or work in?')
    .setChoiceValues([
      'Science, tech, engineering or maths',
      'Medicine or health',
      'Social sciences',
      'Humanities',
      'Business, economics or law',
      'Arts or design',
      'Other',
    ])
    .setRequired(true);

  // ── Section 2: How things are now ────────────────────────────────
  form.addPageBreakItem().setTitle('How things are now');

  form
    .addMultipleChoiceItem()
    .setTitle('In the last month, how often did you meet someone new at uni (outside your own course or lab)?')
    .setChoiceValues(['Never', 'Once', '2–3 times', 'Every week or more'])
    .setRequired(true);

  form
    .addCheckboxItem()
    .setTitle('How do you usually find people to study, grab coffee or go to events with?')
    .setHelpText('Tick all that apply.')
    .setChoiceValues([
      'Friends I already have',
      'Course or department group chats',
      'WhatsApp communities',
      'Societies',
      'Instagram',
      'University events pages / emails',
      'I mostly don\'t',
    ])
    .showOtherOption(true)
    .setRequired(true);

  form
    .addParagraphTextItem()
    .setTitle('What is the hardest part about meeting people at uni?')
    .setHelpText('Optional, but the most useful answer for us.');

  // ── Section 3: The idea ──────────────────────────────────────────
  form
    .addPageBreakItem()
    .setTitle('The idea')
    .setHelpText(
      'Offscript is a free app, only for people with a university email. You can:\n' +
        '• post or join things: coffee runs, study sessions, events, spare tickets, collabs, conference buddies, rants and polls\n' +
        '• get matched with people whose research or interests are close to yours (not a dating app)\n' +
        '• chat with your matches and with everyone going to the same meetup\n' +
        '• build a profile with fun questions, and choose exactly which answers others see'
    );

  form
    .addScaleItem()
    .setTitle('How likely are you to try Offscript when it launches?')
    .setBounds(1, 5)
    .setLabels('Definitely not', 'Definitely')
    .setRequired(true);

  form
    .addCheckboxItem()
    .setTitle('Which features would you actually use?')
    .setHelpText('Tick all that apply. Be honest: "none" is useful too.')
    .setChoiceValues(FEATURES.concat(['None of these']))
    .setRequired(true);

  form
    .addMultipleChoiceItem()
    .setTitle('If you could only have ONE feature, which would make you download it?')
    .setChoiceValues(FEATURES)
    .showOtherOption(true)
    .setRequired(true);

  form
    .addCheckboxItem()
    .setTitle('What would stop you from using it?')
    .setHelpText('Tick all that apply.')
    .setChoiceValues([
      'Nobody I know would be on it',
      'Safety worries about meeting strangers',
      'It might feel like a dating app',
      'Privacy worries',
      'I don\'t have time',
      'I already have too many apps',
      'Nothing, I\'d use it',
    ])
    .showOtherOption(true)
    .setRequired(true);

  form
    .addScaleItem()
    .setTitle('How important is it that only people with a verified university email can join?')
    .setBounds(1, 5)
    .setLabels('Not important', 'Essential')
    .setRequired(true);

  form
    .addMultipleChoiceItem()
    .setTitle('Offscript will be free, paid for by the odd sponsored post (e.g. student discounts, careers events). How do you feel about that?')
    .setChoiceValues([
      'Totally fine',
      'Fine if they are relevant to students',
      'I\'d put up with it',
      'It would put me off using it',
    ])
    .setRequired(true);

  form
    .addParagraphTextItem()
    .setTitle('Anything you\'d add, change or love to see?')
    .setHelpText('Optional.');

  // ── Section 4: Stay in touch ─────────────────────────────────────
  form
    .addPageBreakItem()
    .setTitle('Stay in touch (optional)')
    .setHelpText('Leave your email if you\'d like early access. We\'ll only use it to tell you when Offscript launches.');

  form
    .addTextItem()
    .setTitle('Your email')
    .setValidation(FormApp.createTextValidation().requireTextIsEmail().setHelpText('Please enter a valid email, or leave this blank.').build());

  // ── Responses go to a Google Sheet ───────────────────────────────
  const sheet = SpreadsheetApp.create('Offscript survey responses');
  form.setDestination(FormApp.DestinationType.SPREADSHEET, sheet.getId());

  // Newer Google accounts create forms unpublished; publish it if possible.
  try {
    form.setPublished(true);
  } catch (e) {
    Logger.log('If the form says it is not accepting responses, open the EDIT link and click "Publish".');
  }

  Logger.log('EDIT (only you):      ' + form.getEditUrl());
  Logger.log('SHARE (send to students): ' + form.getPublishedUrl());
  Logger.log('RESPONSES (Google Sheet): ' + sheet.getUrl());
}
