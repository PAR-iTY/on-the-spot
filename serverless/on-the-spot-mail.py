# inspired from: https://codehandbook.org/how-to-read-email-from-gmail-using-python/
# https://github.com/jay3dec/pythonReadEmail

# Python 3.8^ standard libraries
from traceback import print_exc
from imaplib import IMAP4_SSL
from email import message_from_bytes
from base64 import b64decode
from uuid import uuid4
from json import load, dump
from os import walk, linesep
from email.policy import default as default_policy
import configparser
import subprocess

# get environment variables
config = configparser.ConfigParser()
config.read('./env/env.ini')

# -------------------------------------------------
#
# Read email from gmail using python
#
# -------------------------------------------------


def read_email_from_gmail():

    # note: values from env.ini don't need quotes and are all strings
    # except for FROM_BOX as explained below
    FROM_EMAIL = config['DEFAULT']['FROM_USER'] + \
        config['DEFAULT']['ORG_EMAIL']
    FROM_PWD = config['DEFAULT']['FROM_PWD']
    IMAP_SERVER = config['DEFAULT']['IMAP_SERVER']

    # collect new spot data in geojson-friendly 'features' list
    new_spots = []

    # json data to read, update and write back to file
    spots_db = False

    # append each feature to a JSON structure: [{feature}, {feature}]
    with open(f"{config['DEFAULT']['DATA_PATH']}/spots.geojson", 'r') as db_file:
        spots_db = load(db_file)

    try:
        print('\nconnecting to gmail..')
        # SSL to SMTP server via imaplib using credentials
        mail = IMAP4_SSL(IMAP_SERVER)
        mail.login(FROM_EMAIL, FROM_PWD)

        # avoid selecting entire inbox if possible
        # be careful to transmit double quotes to mail.select()
        # env.ini FROM_BOX string includes the double quotes
        mail.select(config['DEFAULT']['FROM_BOX'])

        # can avoid selecting 'ALL'
        # try 'UNSEEN' once its up and running
        mail_data = mail.search(None, 'ALL')

        print('reading mail..')
        # all this is just to list ints [1,...24] to decrement over
        # what about a less variably and extra implementation?
        # range only uses it once: mail.fetch(str(i), '<PROTOCOL>')
        mail_ids = mail_data[1]
        id_list = mail_ids[0].split()

        if not len(id_list):
            print('<error> no email')
            return

        first_id = int(id_list[0])
        last_id = int(id_list[-1])

        # original implementation was not printing final list value
        # range(start, stop, step)
        # ranges stop when they hit their stop arg value
        # ∴ the stop value itself is not used
        # ∴ i need a range of (1, 25)
        for i in range(last_id, first_id - 1, -1):

            # use RFC822 protocol (investigate security/options)
            response = mail.fetch(str(i), '(RFC822)')

            # response is a tuple of length 2
            # for response_part in response:

            # get first item of tuple part
            # arr = response_part[0]

            # if not isinstance(arr, tuple):
            # print('<continue> response_part[0] is not a tuple')
            # continue

            # print('part:', type(arr))
            # bytes and a default policy avoids environment
            # string encoding preferences
            # ∴ is more consistent, predictable and robust
            # msg = email.message_from_bytes(
            #     arr[1], policy=default_policy)

            # condensed into list comprehension
            msgs = [message_from_bytes(res_part[0][1], policy=default_policy)
                    for res_part in response if isinstance(res_part[0], tuple)]

            # list for identifying emails
            subject_strings = ['New submission', 'on-the-spot']

            for msg in msgs:

                # filter for formspree new submissions on on-the-spot only
                if not (msg['from'] == 'Formspree <noreply@formspree.io>' and all(x in msg['subject'] for x in subject_strings)):
                    # print('<continue> wrong mail')
                    continue

                body = msg.get_body(('plain'))

                content = body.get_content()

                # line 26 is base64 value (if it exists)
                # is this split reading all lines up front?
                # could try just grab first 25 ie by yielding
                lines = content.split(linesep)

                # can access features and spots_db here
                # but wastes computation making a full spot
                # just to check the lat/lng

                # shift range props add up to here
                # leave img handling to its own function
                # or idk global or something else
                # theres light repeatable work to do up front
                # and img stuff to do conditionally

                # test if last form field line number has changed
                if lines[21] != 'base64:':
                    # likely some change in form fields number/name
                    # eventually change away from hardcoded 'base64' detection
                    print('<continue> cannot find form fields in message')
                    continue

                # returns the msg spot data in geojson dict structure
                # is this call expensive? use <caching thingy> to check
                # test each functions, img will likely be biggest
                spot_data = get_spot_data(lines)

                # if spot data is wrong and function empty returns
                # todo: improve this cos function is unlikely to falsy
                # q: is a nested empty object falsy? use any()?
                # still not a great test cos line values could be trivially non-empty
                if not any(spot_data.values()):
                    print('<continue> all form fields are empty')
                    print(spot_data)
                    continue

                # quick-test if new spot already exists
                # assume if lat_lng are identical

                # functionalise this test for lat/lng/id's?
                # this would help break the loop when a match is found via return

                # lines[14] = lat value
                # lines[18] = lng value

                # create 2D list of coords
                db_coords = [v['geometry']['coordinates']
                             for v in spots_db['features']]

                # create msg_coords from lines data
                msg_coords = [float(lines[18].strip()),
                              float(lines[14].strip())]

                if msg_coords in db_coords:
                    print('<continue> spot already exists')
                    continue

                # enforce no whitespace and use hypens?
                # or let people say what they wanna say?
                # or save both?

                # make spot name up front to ref into functions
                spot_name = lines[6].strip().lower()

                # make spot id up front to ref into functions
                spot_id = str(uuid4())[:8].lower()

                # add id
                spot_data['id'] = spot_id

                # check if new spot image already exists
                if match_file_name(f"{config['DEFAULT']['DATA_PATH']}/img", spot_name):
                    print('<continue> spot name already exists in images')
                    continue

                # img_file is changed to the path if the image exists
                # i dont think i need these if False's
                img_file = False

                # handle img if it exists in msg but not on disk
                if lines[22]:
                    img_file = save_base64_img(
                        lines[22].strip(), spot_name, spot_id)

                # add path to image
                if img_file:
                    spot_data['picture'] = img_file

                # organise spot data into geojson feature dict
                # couldnt properties dict be filled out with a loop?
                # coordinates in GeoJSON: [longitude, latitude] --> use this one
                # coordinates in Leaflet: [latitude, longitude]
                # [float(spot_data['longitude']), float(spot_data['latitude'])]
                feature = {
                    "type": "Feature",
                    "geometry": {
                        "type": "Point",
                        "coordinates": msg_coords
                    },
                    "properties": {
                        "id": spot_data['id'],
                        "name": spot_data['name'],
                        "city": spot_data['city'],
                    }
                }

                # check for spot picture
                if 'picture' in spot_data:
                    # add picture filename to spot feature
                    feature['properties']['picture'] = spot_data['picture']

                # add feature to spots list
                new_spots.append(feature)

                # print(f"found {feature['properties']['name']}..")
            # else:
                # print('some other response part')

    except Exception as e:
        print_exc()
        print(str(e))
        return

    if not new_spots:
        print('..no new spots found\n')
        return

    print(f"found {len(new_spots)} new spot{'s' if len(new_spots) != 1 else ''}")

    # this is far better approach
    # communicates to devs declaratively
    # uses built ins and avoids branching

    # print(f"{len(spots_db['features'])}")
    # print(spots_db['features'])

    # get a list of spots from db
    db_spots = spots_db.get('features', [])

    print(f"found {len(db_spots)} old spot{'s' if len(db_spots) != 1 else ''}")

    # todo: add some id checker thingy here
    print('updating spots..')

    # add new spots to list
    db_spots.extend(new_spots)

    # add all spots back to db
    spots_db['features'] = db_spots

    print(
        f"total spot{'s' if len(spots_db['features']) != 1 else ''}: {len(spots_db['features'])}")

    # write updated spots back to file
    with open(f"{config['DEFAULT']['DATA_PATH']}/spots.geojson", 'w') as json_file:
        dump(spots_db, json_file, indent=2)

    print('updated spots database')

    print('pushing changes to github..')

    result_git_add = subprocess.run(
        ["git", "add", "-A"], cwd=config['DEFAULT']['DATA_PATH'])

    result_git_commit = subprocess.run(
        ["git", "commit", "-m", "updated spots from python"], cwd=config['DEFAULT']['DATA_PATH'])

    result_git_push = subprocess.run(
        ["git", "push", "origin", "main"], cwd=config['DEFAULT']['DATA_PATH'])

    # if needed can check results e.g:
    # print(result_git_push.stderr)

    print('..done\n')

# -------------------------------------------------
#
# Parses message content into spot data dict
#
# -------------------------------------------------

    # expect a change: removing email form field
    # to automate parameterise some values like:
    # or use +4 system from starting_point = 5

    # <assume> msg content is predictable
    # because if lines[n] == <last_form_field> check has been done
    # prior to calling this function


def get_spot_data(lines):
    # starting key:value at 5:6, next at +4
    # apply line-plucking
    spot_data = {lines[n][:-1].strip().lower(): lines[n + 1].strip().lower()
                 for n in range(5, 22, 4)}

    return spot_data

# -------------------------------------------------
#
# Checks if file names match a given substring
# Returns a Boolean
#
# -------------------------------------------------


def match_file_name(file_dir, match_name):

    file_names = next(walk(file_dir), (None, None, []))[2]

    # todo :there must be a better higher order method to do this with
    # feels like im walking the file_directory then looping to check
    # surely this could be one loop?
    for file_name in file_names:
        if file_name.startswith(match_name.replace(' ', '-') + '-'):
            print('found a match:', file_name.replace('-', ' '), match_name)
            # end loop after first match
            return True

    return False

# -------------------------------------------------
#
# Creates metadata and file from base64 string
#
# -------------------------------------------------


def save_base64_img(data_url, spot_name, spot_id):
    # todo: return an object with created values instead of updating globals
    # 'jpg' and 'png' exts only (form restricts file types)
    # that validation is still client-side vulnerable though
    # todo: add (MIME?) type checks for jpg/png only
    #       (or all valid/safe image types)

    # change 'jpeg' to 'jpg' and maintain 'png' as is
    ext = data_url[11:15].lower().replace('e', '').replace(';', '')

    # remove data URI scheme prefix
    b64 = data_url[data_url.find(';base64,') + len(';base64,'):]

    # img file name: <spot-name>-<uuid>.<jpg/png>
    # replace all whitespaces in spot_name with hypens
    file_name = f"{spot_name.replace(' ', '-')}-{spot_id}.{ext}"

    # write out to image file
    with open(f"{config['DEFAULT']['DATA_PATH']}/img/{file_name}", "wb") as fh:
        fh.write(b64decode(b64))

    return file_name

# -------------------------------------------------
#
# Runs module if called directly
#
# -------------------------------------------------


if __name__ == '__main__':
    read_email_from_gmail()
