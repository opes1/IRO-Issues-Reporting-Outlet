/**
 * IRO – Issues Reporting Outlet
 * Google Apps Script that builds the community questionnaire in Google Forms.
 * Run createIroQuestionnaire() at script.google.com; the form link is logged.
 * The form branches: Students and Indigenes answer different sections,
 * then both answer the common "Reporting & the IRO platform" section.
 */
function createIroQuestionnaire() {
  var form = FormApp.create('IRO (Issues Reporting Outlet) – Community Questionnaire');
  form.setDescription(
    'This questionnaire is part of a feasibility study for IRO (Issues Reporting Outlet), a web-based system ' +
    'for reporting and relating issues concerning AAUA students and the indigenes of Akungba, Iwaro, Etioro, ' +
    'Ayegunle and neighbouring communities. Your answers are anonymous and will be used only for this study. ' +
    'It takes about 5 minutes.');
  form.setCollectEmail(false);
  form.setProgressBar(true);

  // ---------- Section 1: About you ----------
  var who = form.addMultipleChoiceItem().setTitle('Which of these best describes you?').setRequired(true);
  form.addMultipleChoiceItem().setTitle('Age range').setRequired(true)
    .setChoiceValues(['Below 18', '18 – 25', '26 – 35', '36 – 50', 'Above 50']);
  form.addMultipleChoiceItem().setTitle('Gender').setRequired(false)
    .setChoiceValues(['Male', 'Female', 'Prefer not to say']);

  // ---------- Section 2: Students ----------
  var stuPage = form.addPageBreakItem().setTitle('Section A: For AAUA Students');
  form.addMultipleChoiceItem().setTitle('Your level').setRequired(true)
    .setChoiceValues(['100', '200', '300', '400', '500', 'Postgraduate']);
  form.addTextItem().setTitle('Your faculty').setRequired(false);
  form.addMultipleChoiceItem().setTitle('Where do you live?').setRequired(true)
    .setChoiceValues(['On-campus hostel', 'Off-campus – Akungba', 'Off-campus – Iwaro', 'Off-campus – Etioro',
      'Off-campus – Ayegunle', 'Other community']);
  form.addMultipleChoiceItem().setTitle('Have you ever had an issue involving indigenes, landlords or the host community?')
    .setRequired(true).setChoiceValues(['Yes', 'No']);
  form.addCheckboxItem().setTitle('Which issues have you experienced or witnessed? (tick all that apply)')
    .setChoiceValues(['Insecurity / theft / cult activity', 'Rent or accommodation disputes', 'Harassment or extortion',
      'Student–indigene clashes', 'Bad roads / transport problems', 'Water or electricity problems',
      'Poor sanitation / environment', 'None']).showOtherOption(true);
  form.addCheckboxItem().setTitle('How did you report the issue (if at all)?')
    .setChoiceValues(['I did not report it', 'Student Union (SUG)', 'Landlord / caretaker', 'University security',
      'Police', 'Social media', 'Community leader']).showOtherOption(true);

  // ---------- Section 3: Indigenes ----------
  var indPage = form.addPageBreakItem().setTitle('Section B: For Indigenes / Residents');
  form.addMultipleChoiceItem().setTitle('Your community').setRequired(true)
    .setChoiceValues(['Akungba', 'Iwaro', 'Etioro', 'Ayegunle']).showOtherOption(true);
  form.addMultipleChoiceItem().setTitle('Your role in the community').setRequired(true)
    .setChoiceValues(['Landlord / caretaker', 'Trader / business owner', 'Transporter (okada, taxi, keke)',
      'Community / youth leader', 'Civil servant', 'Farmer', 'Resident']).showOtherOption(true);
  form.addMultipleChoiceItem().setTitle('How long have you lived in the community?').setRequired(true)
    .setChoiceValues(['Less than 2 years', '2 – 5 years', '6 – 10 years', 'More than 10 years / born here']);
  form.addMultipleChoiceItem().setTitle('Have you ever had an issue involving AAUA students?')
    .setRequired(true).setChoiceValues(['Yes', 'No']);
  form.addCheckboxItem().setTitle('Which issues have you experienced or witnessed? (tick all that apply)')
    .setChoiceValues(['Unpaid rent / damage to property', 'Noise and disturbance', 'Theft or insecurity',
      'Cult activity', 'Student–indigene clashes', 'Land / property disputes', 'Poor sanitation / environment', 'None'])
    .showOtherOption(true);
  form.addCheckboxItem().setTitle('How did you report the issue (if at all)?')
    .setChoiceValues(['I did not report it', 'Oba / community leader', 'University management', 'Student Union (SUG)',
      'Police', 'Social media']).showOtherOption(true);

  // ---------- Section 4: Common ----------
  var common = form.addPageBreakItem().setTitle('Section C: Reporting & the IRO platform');
  form.addScaleItem().setTitle('How satisfied are you with the current ways of reporting such issues?')
    .setBounds(1, 5).setLabels('Very dissatisfied', 'Very satisfied').setRequired(true);
  form.addCheckboxItem().setTitle('What stops people from reporting issues? (tick all that apply)')
    .setChoiceValues(['Fear of victimisation', 'Do not know where to report', 'Nothing is done after reporting',
      'Process is too slow', 'Distrust between students and indigenes', 'No feedback after reporting'])
    .showOtherOption(true);
  form.addMultipleChoiceItem().setTitle('Would you use a web platform (IRO) to report and track issues?')
    .setRequired(true).setChoiceValues(['Yes', 'Maybe', 'No']);
  form.addScaleItem().setTitle('How important is it that you can report anonymously?')
    .setBounds(1, 5).setLabels('Not important', 'Very important').setRequired(true);
  form.addCheckboxItem().setTitle('Which features would you want in IRO? (tick all that apply)')
    .setChoiceValues(['Anonymous reporting', 'Tracking ID to follow up my report', 'SMS / WhatsApp updates',
      'Upload photos as evidence', 'Yoruba language option', 'Emergency contact numbers',
      'Joint university–community response desk']).showOtherOption(true);
  form.addMultipleChoiceItem().setTitle('Which device would you mostly use?')
    .setChoiceValues(['Smartphone', 'Laptop / desktop', 'Basic (feature) phone', 'Cyber café']);
  form.addParagraphTextItem().setTitle('Any other suggestion for improving student–community relations?');

  // ---------- Branching ----------
  who.setChoices([
    who.createChoice('AAUA Student', stuPage),
    who.createChoice('Indigene / Resident of a host community', indPage)
  ]);
  // A page break's goToPage applies to the section just before it.
  // indPage ends the Student section, so students skip the Indigene section:
  indPage.setGoToPage(common);

  form.setConfirmationMessage('Thank you! Your response will help shape IRO.');
  Logger.log('Edit link: ' + form.getEditUrl());
  Logger.log('Share link: ' + form.getPublishedUrl());
}
