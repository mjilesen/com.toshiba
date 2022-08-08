
Connect your Airco unit to Homey and control it directly from Homey.

Use the power of Homey flows to automate your airco schedule.

Required Hardware/software: airco is connected to Toshiba Home AC Control App.

Please be aware that due to technical limitations, only the selections in the flows are according to what are allowed values for certain capabilities.
In the capabilities per device, all options are visible and (most of the times) not all are available for your device.

When creating a flow with then cards for a device, the last "then" card should always be "Send changes to AC". If you are using "normal" flows, this card should have a delay of minimal 2 seconds.
When using advanced flows, the delay is not needed because cards are executed in the order you define them (tip: use can use an "all" card to set the capabilities and then the "send changes to AC" card).

Suggestions or problems?
If you have a device that's not supported or a suggestion or problem with this app please go to the forum or the github page linked on this page and let me know.
