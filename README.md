<p align="center"><a href="https://nodei.co/npm/@salty-coder/discordjs-pagination/"><img src="https://nodei.co/npm/@salty-coder/discordjs-pagination.png" alt=""></a></p>

<div align="center">
<a href="https://github.com/Salty-Coder/discordjs-pagination/issues"><img alt="GitHub issues" src="https://img.shields.io/github/issues/Salty-Coder/discordjs-pagination"></a>
<a href="https://github.com/Salty-Coder/discordjs-pagination/stargazers"><img alt="GitHub stars" src="https://img.shields.io/github/stars/Salty-Coder/discordjs-pagination"></a>
<a href="https://github.com/Salty-Coder/discordjs-pagination/blob/master/MIT-LICENCE"><img alt="GitHub license" src="https://img.shields.io/github/license/Salty-Coder/discordjs-pagination?color=red"></a>
<img alt="npm" src="https://img.shields.io/npm/dw/@salty-coder/discordjs-pagination?color=purple">
<br>
<img alt="npm (tag)" src="https://img.shields.io/npm/v/@salty-coder/discordjs-pagination/latest?color=yellow&label=%40salty-coder%2Fdiscordjs-pagination">
</div>

# `❓discordjs-pagination`

An advanced module with quick setup and different options to implement pagination system for Discord.js.
<br>**_This package is updated to no longer include depreciated attributes._**


<img src="./demo/demo.gif">

### This is a fork of the project [devRael1/discordjs-pagination](https://github.com/) which was archived in 2024.<br/>I wish to take on this project and keep it updated, to be optimised for the latest Discord.js versions.
<br/>

## `📥 Installation`

To install this module type the following command in your console:

```
npm install @salty-coder/discordjs-pagination
```

## `⚙️ Pagination Module Options`

| Options Object Name |                           Default Type                           | Description                                                                                        |
|:--------------------|:----------------------------------------------------------------:|:---------------------------------------------------------------------------------------------------|
| `client`            |                             `Client`                             | Bot client, **only useful if** `time >= 900000` (i.e greater than 15 minutes)                      |
| `interaction`       | `MessageComponentInteraction` <br />or<br />`CommandInteraction` | Interaction to reply with the pagination system <br />(The interaction can be deferred or replied) |
| `message`           |                            `Message`                             | Message Object to send the pagination system                                                       |
| `ephemeral`         |                            `boolean`                             | If the returned message should be ephemeral (Can only use in Interaction)                          |
| `embeds`            |                            `Embed[]`                             | Array of embeds to paginate                                                                        |
| `author`            |                              `User`                              | Author's user class                                                                                |
| `buttons`           |                           `Buttons[]`                            | Customization of your buttons <br />*See examples below*                                           |
| `disableButtons`    |                            `boolean`                             | Disable or remove buttons after timeout (true = disable, false = remove)                           |
| `deleteAtEnd`       |                            `boolean`                             | Delete or not the embed or message after timeout (true = remove, false = keep)                     |
| `pageTravel`        |                            `boolean`                             | Travel pages by sending page numbers (With Modal Interaction)                                      |
| `fastSkip`          |                            `boolean`                             | Create two additional buttons, a button to skip to the end and a button to skip to the first page  |
| `time`              |                             `number`                             | How long before pagination get disabled **(in ms)**                                                |
| `max`               |                             `number`                             | Maximum interactions with buttons before disabling the pagination                                  |
| `customFilter`      |                            `boolean`                             | Custom filter for message component collector <br /> **Must return boolean**                       |

## `⬇️ Examples`

### Declare & Use Pagination System

```js
/** Decalre the module */
const {pagination, ButtonTypes, ButtonStyles} = require('@salty-coder/discordjs-pagination');
/** Use pagination system */
await pagination({
  /** Pagination options here */
});
```

---

### Use pagination System with custom buttons

```js
await pagination({
  embeds: arrayEmbeds, /** Array of embeds objects */
  author: interaction.member.user,
  interaction: interaction,
  ephemeral: true,
  time: 40000, /** 40 seconds */
  disableButtons: false, /** Remove buttons after timeout */
  fastSkip: false,
  pageTravel: false,
  buttons: [
    {
      type: ButtonTypes.previous,
      label: 'Previous Page',
      style: ButtonStyles.Primary
    },
    {
      type: ButtonTypes.next,
      label: 'Next Page',
      style: ButtonStyles.Success
    }
  ]
});
```

---

### Use pagination System with custom buttons and custom filter

```js
await pagination({
  interaction: interaction,
  embeds: arrayEmbeds,
  author: interaction.member.user,
  time: 40000,
  fastSkip: false,
  disableButtons: true,
  pageTravel: false,
  /** Enable buttons pagination system only for member with ID: 123456789 */
  customFilter: (interaction: CommandInteraction|MessageComponentInteraction) => {
    return interaction.member.user.id === '123456789';
  },
  buttons: [
    {
      type: ButtonTypes.previous,
      label: 'Previous Page',
      style: ButtonStyles.Success,
      emoji: '◀️'
    },
    {
      type: ButtonTypes.next,
      label: 'Next Page',
      style: ButtonStyles.Success,
      emoji: null /** Disable emoji for this button */
    }
  ]
});
```
## `🐛 Bug Reports`

If you have any bugs or trouble setting the module up, feel free to open an issue
on [GitHub Repository](https://github.com/Salty-Coder/discordjs-pagination)
<br>

## `🗃️ Old Versions`
If you want to use old version, you can use command
```
npm install @salty-coder/discordjs-pagination@<version>
```
## `🧾 TODO`

* Create new `customComponents` parameter to let the user choose to add buttons / selections menus in the
  components of the pagination system.
* Create new `Screenshots` section in README and show examples
* Make the package compatible so that it takes into account an array of `Message` objects and not only an array of 
  `Embed` objects.

## `📝 License`
Copyright © 2022 [devRael1](https://github.com/devRael1)
<br>This project is MIT licensed.
<br>This is not an official Discord product. It is not affiliated with or endorsed by Discord Inc.
