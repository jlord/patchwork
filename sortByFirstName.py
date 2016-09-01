import os;
import glob;
import logging;
import string;
import itertools;

def createDir(dir_suffix):
    """
    Function that creates directories if they don't exist. If they do, then it
    just skips over to the next alphabet/number.
    """
    try:
        if(dir_suffix.istitle):
            dir_suffix = dir_suffix.lower()

        dir = "contributors/"+dir_suffix

        if (not os.path.isdir(dir)):
            os.mkdir(dir)
            print "Created directory " + dir
        else :
            print "Directory " + dir + " already exists, continuing."
    except Exception as e:
        logging.exception("I just derped :/");

def moveFilesToFolders(destinaton_id):
    """
    Function that searches for all the files in a directory that match a certain
    pattern and moves the files to the appropriate place.
    """
    files_string = "contributors/add-" + destinaton_id + "*"
    destination_string_prefix = "contributors/"+destinaton_id +"/"
    if(destination_string_prefix.istitle):
        destination_string_prefix = "contributors/"+destinaton_id.lower() + "/"

    for filename in glob.glob(files_string):
        destination_path =    destination_string_prefix \
                            + filename.split("/")[1]
        print "moving " + filename + " to " + destination_path
        os.rename(filename, destination_path);


#Main code starts here
#Check if contributors exists and is a diretory
if (os.path.exists("contributors") & os.path.isdir("contributors")):
    #now, create a whole host of folders in this directory
    #First a-z, then A-Z and then 0-9
    for character in itertools.chain(string.ascii_lowercase, string.ascii_uppercase, string.digits):
        createDir(character)
        moveFilesToFolders(character)
